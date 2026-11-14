package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strconv"
	"strings"
)

type field struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Tag string `json:"tag,omitempty"`
	Embedded bool `json:"embedded,omitempty"`
}

type endpoint struct {
	Method string `json:"method"`
	Path string `json:"path"`
	Request string `json:"request,omitempty"`
	Response string `json:"response,omitempty"`
}

type contract struct {
	Types map[string][]field `json:"types"`
	Endpoints []endpoint `json:"endpoints"`
}

func expression(expr ast.Expr) string {
	switch value := expr.(type) {
	case *ast.Ident:
		return value.Name
	case *ast.SelectorExpr:
		return expression(value.X) + "." + value.Sel.Name
	case *ast.StarExpr:
		return "*" + expression(value.X)
	case *ast.ArrayType:
		return "[]" + expression(value.Elt)
	case *ast.MapType:
		return "map[" + expression(value.Key) + "]" + expression(value.Value)
	case *ast.InterfaceType:
		return "unknown"
	}
	return "unknown"
}

func text(expr ast.Expr) string {
	if literal, ok := expr.(*ast.BasicLit); ok {
		value, _ := strconv.Unquote(literal.Value)
		return value
	}
	return ""
}

func parseFile(name string) *ast.File {
	file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
	if err != nil { panic(err) }
	return file
}

func main() {
	root := os.Args[1]
	result := contract{Types: map[string][]field{}}
	typeFiles, _ := filepath.Glob(filepath.Join(root, "internal/types/*.go"))
	for _, name := range typeFiles {
		file := parseFile(name)
		ast.Inspect(file, func(node ast.Node) bool {
			spec, ok := node.(*ast.TypeSpec)
			if !ok { return true }
			structure, ok := spec.Type.(*ast.StructType)
			if !ok { return false }
			fields := []field{}
			for _, member := range structure.Fields.List {
				if len(member.Names) == 0 {
					fields = append(fields, field{Type: expression(member.Type), Embedded: true})
					continue
				}
				tag := ""
				if member.Tag != nil { tag, _ = strconv.Unquote(member.Tag.Value) }
				for _, name := range member.Names {
					if reflect.StructTag(tag).Get("json") == "-" { continue }
					fields = append(fields, field{Name: name.Name, Type: expression(member.Type), Tag: tag})
				}
			}
			result.Types[spec.Name.Name] = fields
			return false
		})
	}
	handlers := map[string]string{}
	responses := map[string]string{}
	importsFor := func(file *ast.File) map[string]string {
		imports := map[string]string{}
		for _, spec := range file.Imports {
			name := text(spec.Path)
			alias := filepath.Base(name)
			if spec.Name != nil { alias = spec.Name.Name }
			imports[alias] = name
		}
		return imports
	}
	filepath.WalkDir(filepath.Join(root, "internal/logic"), func(name string, entry os.DirEntry, err error) error {
		if err != nil || entry.IsDir() || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") { return err }
		file := parseFile(name)
		for _, declaration := range file.Decls {
			function, ok := declaration.(*ast.FuncDecl)
			if !ok || function.Recv == nil || function.Type.Results == nil { continue }
			receiver := strings.TrimPrefix(expression(function.Recv.List[0].Type), "*")
			for _, value := range function.Type.Results.List {
				kind := expression(value.Type)
				if strings.HasPrefix(kind, "*types.") { responses[receiver+"."+function.Name.Name] = strings.TrimPrefix(kind, "*types.") }
			}
		}
		return nil
	})
	filepath.WalkDir(filepath.Join(root, "internal/handler"), func(name string, entry os.DirEntry, err error) error {
		if err != nil || entry.IsDir() || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") { return err }
		file := parseFile(name)
		for _, declaration := range file.Decls {
			function, ok := declaration.(*ast.FuncDecl)
			if !ok || function.Body == nil { continue }
			key := filepath.ToSlash(filepath.Dir(name)) + "." + function.Name.Name
			ast.Inspect(function.Body, func(node ast.Node) bool {
				if value, ok := node.(*ast.ValueSpec); ok && value.Type != nil && strings.HasPrefix(expression(value.Type), "types.") {
					handlers[key] = strings.TrimPrefix(expression(value.Type), "types.")
				}
				if call, ok := node.(*ast.CallExpr); ok {
					if selector, ok := call.Fun.(*ast.SelectorExpr); ok && strings.HasPrefix(selector.Sel.Name, "New") && strings.HasSuffix(selector.Sel.Name, "Logic") {
						logic := strings.TrimPrefix(selector.Sel.Name, "New")
						for method, response := range responses {
							if strings.HasPrefix(method, logic+".") { handlers[key+".response"] = response }
						}
					}
				}
				return true
			})
		}
		return nil
	})
	for _, routeFile := range []string{"routes.go", "native_routes.go", "v2_order_routes.go"} {
		file := parseFile(filepath.Join(root, "internal/handler", routeFile))
		imports := importsFor(file)
		for _, declaration := range file.Decls {
			function, ok := declaration.(*ast.FuncDecl)
			if !ok || function.Body == nil { continue }
			groups := map[string]string{"router": ""}
			ast.Inspect(function.Body, func(node ast.Node) bool {
				if assignment, ok := node.(*ast.AssignStmt); ok && len(assignment.Rhs) == 1 && len(assignment.Lhs) == 1 {
					if call, ok := assignment.Rhs[0].(*ast.CallExpr); ok && len(call.Args) > 0 {
						if selector, ok := call.Fun.(*ast.SelectorExpr); ok && selector.Sel.Name == "Group" {
							groups[expression(assignment.Lhs[0])] = groups[expression(selector.X)] + text(call.Args[0])
						}
					}
				}
				call, ok := node.(*ast.CallExpr)
				if !ok || len(call.Args) < 2 { return true }
				selector, ok := call.Fun.(*ast.SelectorExpr)
				if !ok || !strings.Contains(" GET POST PUT PATCH DELETE HEAD OPTIONS ", " "+selector.Sel.Name+" ") { return true }
				if _, ok := call.Args[0].(*ast.BasicLit); !ok { return true }
				item := endpoint{Method: selector.Sel.Name, Path: groups[expression(selector.X)]+text(call.Args[0])}
				ast.Inspect(call.Args[len(call.Args)-1], func(child ast.Node) bool {
					handlerCall, ok := child.(*ast.CallExpr)
					if !ok { return true }
					handler, ok := handlerCall.Fun.(*ast.SelectorExpr)
					if !ok { return true }
					importPath := imports[expression(handler.X)]
					if strings.Contains(importPath, "/internal/handler/") {
						relative := strings.SplitN(importPath, "/internal/handler/", 2)[1]
						key := filepath.ToSlash(filepath.Join(root, "internal/handler", relative))+"."+handler.Sel.Name
						item.Request = handlers[key]
						item.Response = handlers[key+".response"]
					}
					return true
				})
				result.Endpoints = append(result.Endpoints, item)
				return true
			})
		}
	}
	sort.Slice(result.Endpoints, func(left, right int) bool { return result.Endpoints[left].Path+result.Endpoints[left].Method < result.Endpoints[right].Path+result.Endpoints[right].Method })
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(result); err != nil { fmt.Fprintln(os.Stderr, err); os.Exit(1) }
}