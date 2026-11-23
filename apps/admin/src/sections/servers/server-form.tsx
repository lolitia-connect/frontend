"use client";

import {
  Accordion,
  AccordionPanel as AccordionContent,
  AccordionHeading,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
  buttonVariants,
  Dropdown,
  ListBox,
  Select,
  SelectPopover as SelectContent,
  SelectIndicator,
  ListBoxItem as SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  toast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { TagInput } from "@workspace/ui/composed/tag-input";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNode } from "@/stores/node";
import {
  type FieldConfig,
  formSchema,
  getLabel,
  getProtocolDefaultConfig,
  protocols as PROTOCOLS,
  type ProtocolType,
  useProtocolFields,
} from "./form-schema";
import {
  getProtocolFormValues,
  preserveUneditableProtocols,
} from "./form-schema/values";

function getFieldLabel(field: FieldConfig) {
  return (
    <>
      {field.label}
      {field.required ? (
        <span aria-hidden="true" className="ml-1 text-danger">
          *
        </span>
      ) : null}
    </>
  );
}

function getVisibleRequiredFields(
  fields: FieldConfig[],
  protocolData: Record<string, any>
) {
  return fields.filter(
    (field) =>
      field.required && (!field.condition || field.condition(protocolData, {}))
  );
}

function findFirstFormError(
  errors: unknown,
  path: string[] = []
): { path: string[]; message: string } | undefined {
  if (!errors || typeof errors !== "object") return;

  // FieldError.ref can point to a DOM node; only traverse nested field errors.
  for (const [key, value] of Object.entries(errors)) {
    if (key === "ref" || key === "types") continue;
    const nested = findFirstFormError(value, [...path, key]);
    if (nested) return nested;
  }

  if ("message" in errors && typeof errors.message === "string") {
    return { path, message: errors.message };
  }
}

function nextProtocolId(protocols: any[], type: ProtocolType) {
  const maxId = protocols
    .filter((p) => p?.type === type)
    .reduce((max, p) => {
      const id = Number(p?.id || 0);
      return Number.isFinite(id) && id > max ? id : max;
    }, 0);
  return String(maxId + 1);
}

function DynamicField({
  field,
  control,
  form,
  protocolIndex,
  protocolData,
}: {
  field: FieldConfig;
  control: any;
  form: any;
  protocolIndex: number;
  protocolData: any;
}) {
  const fieldName = `protocols.${protocolIndex}.${field.name}` as const;

  if (field.condition && !field.condition(protocolData, {})) {
    return null;
  }

  const commonProps = {
    control,
    name: fieldName,
  };

  switch (field.type) {
    case "input":
      return (
        <FormField
          {...commonProps}
          render={({ field: fieldProps }) => (
            <FormItem>
              <FormLabel>{getFieldLabel(field)}</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...fieldProps}
                  onValueChange={(v) => fieldProps.onChange(v)}
                  placeholder={field.placeholder}
                  suffix={
                    field.generate ? (
                      field.generate.functions &&
                      field.generate.functions.length > 0 ? (
                        <Dropdown>
                          <Dropdown.Trigger
                            className={buttonVariants({
                              variant: "ghost",
                              size: "sm",
                              class: undefined,
                            })}
                            type="button"
                          >
                            <Icon className="h-4 w-4" icon="mdi:key" />
                          </Dropdown.Trigger>
                          <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu aria-label="Actions">
                              {field.generate.functions.map((genFunc, idx) => (
                                <Dropdown.Item
                                  key={idx}
                                  onAction={async () => {
                                    const result =
                                      await genFunc.function(protocolData);
                                    if (typeof result === "string") {
                                      fieldProps.onChange(result);
                                    } else if (field.generate!.updateFields) {
                                      Object.entries(
                                        field.generate!.updateFields
                                      ).forEach(([fieldName, resultKey]) => {
                                        const fullFieldName = `protocols.${protocolIndex}.${fieldName}`;
                                        form.setValue(
                                          fullFieldName,
                                          (result as any)[resultKey]
                                        );
                                      });
                                    } else if (result.privateKey) {
                                      fieldProps.onChange(result.privateKey);
                                    }
                                  }}
                                >
                                  {genFunc.label}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      ) : field.generate.function ? (
                        <Button
                          onClick={async () => {
                            const result =
                              await field.generate!.function!(protocolData);
                            if (typeof result === "string") {
                              fieldProps.onChange(result);
                            } else if (field.generate!.updateFields) {
                              Object.entries(
                                field.generate!.updateFields
                              ).forEach(([fieldName, resultKey]) => {
                                const fullFieldName = `protocols.${protocolIndex}.${fieldName}`;
                                form.setValue(
                                  fullFieldName,
                                  (result as any)[resultKey]
                                );
                              });
                            } else if (result.privateKey) {
                              fieldProps.onChange(result.privateKey);
                            }
                          }}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Icon className="h-4 w-4" icon="mdi:key" />
                        </Button>
                      ) : null
                    ) : (
                      field.suffix
                    )
                  }
                  type="text"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "number":
      return (
        <FormField
          {...commonProps}
          render={({ field: fieldProps }) => (
            <FormItem>
              <FormLabel>{getFieldLabel(field)}</FormLabel>
              <FormControl>
                <EnhancedInput
                  {...fieldProps}
                  max={field.max}
                  min={field.min}
                  onValueChange={(v) => fieldProps.onChange(v)}
                  placeholder={field.placeholder}
                  step={field.step || 1}
                  suffix={field.suffix}
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "select":
      if (!field.options || field.options.length <= 1) {
        return null;
      }

      return (
        <FormField
          {...commonProps}
          render={({ field: fieldProps }) => (
            <FormItem>
              <FormLabel>{getFieldLabel(field)}</FormLabel>
              <FormControl>
                <Select
                  onSelectionChange={(key) => {
                    if (key != null)
                      ((v) =>
                        field.name === "ech_enable"
                          ? fieldProps.onChange(v === "true")
                          : fieldProps.onChange(v))(String(key));
                  }}
                  selectedKey={
                    (field.name === "ech_enable"
                      ? String(
                          (fieldProps.value ?? field.defaultValue ?? false) ===
                            true
                        )
                      : (fieldProps.value ?? field.defaultValue)) == null
                      ? undefined
                      : String(
                          field.name === "ech_enable"
                            ? String(
                                (fieldProps.value ??
                                  field.defaultValue ??
                                  false) === true
                              )
                            : (fieldProps.value ?? field.defaultValue)
                        )
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                      <SelectIndicator />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <ListBox>
                      {field.options?.map((option) => (
                        <SelectItem id={option} key={option}>
                          {getLabel(option)}
                        </SelectItem>
                      ))}
                    </ListBox>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "switch":
      return (
        <FormField
          {...commonProps}
          render={({ field: fieldProps }) => (
            <FormItem>
              <FormLabel>{getFieldLabel(field)}</FormLabel>
              <FormControl>
                <div className="pt-2">
                  <Switch
                    checked={!!fieldProps.value}
                    onCheckedChange={(checked) => fieldProps.onChange(checked)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "string-list":
      return (
        <FormField
          {...commonProps}
          render={({ field: fieldProps }) => (
            <FormItem className="col-span-2">
              <FormLabel>{getFieldLabel(field)}</FormLabel>
              <FormControl>
                <TagInput
                  onChange={fieldProps.onChange}
                  value={fieldProps.value || []}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "json":
    case "textarea":
      return (
        <FormField
          {...commonProps}
          render={({ field: fieldProps }) => (
            <FormItem className="col-span-2">
              <FormLabel>{getFieldLabel(field)}</FormLabel>
              <FormControl>
                <Textarea
                  {...fieldProps}
                  onChange={(e) => fieldProps.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  value={fieldProps.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
}

function renderFieldsByGroup(
  fields: FieldConfig[],
  group: string,
  control: any,
  form: any,
  protocolIndex: number,
  protocolData: any
) {
  const groupFields = fields.filter((field) => field.group === group);
  if (groupFields.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {groupFields.map((field) => (
        <DynamicField
          control={control}
          field={field}
          form={form}
          key={field.name}
          protocolData={protocolData}
          protocolIndex={protocolIndex}
        />
      ))}
    </div>
  );
}

function renderGroupCard(
  title: string,
  fields: FieldConfig[],
  group: string,
  control: any,
  form: any,
  protocolIndex: number,
  protocolData: any
) {
  const groupFields = fields.filter((field) => field.group === group);
  if (groupFields.length === 0) return null;

  const visibleFields = groupFields.filter(
    (field) => !field.condition || field.condition(protocolData, {})
  );

  if (visibleFields.length === 0) return null;

  return (
    <div className="relative">
      <fieldset className="rounded-lg border border-border">
        <legend className="ml-3 bg-background px-1 py-1 font-medium text-foreground text-sm">
          {title}
        </legend>
        <div className="p-4 pt-2">
          {renderFieldsByGroup(
            fields,
            group,
            control,
            form,
            protocolIndex,
            protocolData
          )}
        </div>
      </fieldset>
    </div>
  );
}

export default function ServerForm(props: {
  trigger: string;
  title: string;
  loading?: boolean;
  initialValues?: Partial<API.Server>;
  onSubmit: (values: Partial<API.Server>) => Promise<boolean> | boolean;
}) {
  const { trigger, title, loading, initialValues, onSubmit } = props;
  const { t } = useTranslation("servers");
  const [open, setOpen] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string>();

  const { isProtocolUsedInNodes } = useNode();
  const PROTOCOL_FIELDS = useProtocolFields();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sort: 0,
      address: "",
      country: "",
      city: "",
      protocols: [] as any[],
      ...initialValues,
    },
  });
  const { control } = form;

  const protocolsValues = useWatch({ control, name: "protocols" });

  function addProtocolInstance(type: ProtocolType) {
    const current = form.getValues("protocols") || [];
    const id = nextProtocolId(current, type);
    const next = {
      ...getProtocolDefaultConfig(type),
      id,
      name: `${type} ${id}`,
      type,
      enable: true,
    };
    form.setValue("protocols", [...current, next], { shouldDirty: true });
    setAccordionValue(`${type}:${id}:${current.length}`);
  }

  function removeProtocolInstance(index: number) {
    const current = form.getValues("protocols") || [];
    form.setValue(
      "protocols",
      current.filter((_: any, i: number) => i !== index),
      { shouldDirty: true }
    );
    if (accordionValue) setAccordionValue(undefined);
  }

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: "",
        sort: 0,
        address: "",
        country: "",
        city: "",
        ...initialValues,
        protocols: getProtocolFormValues(initialValues.protocols),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  function validateEnabledProtocols(values: Record<string, any>) {
    let firstInvalidProtocol: string | undefined;

    for (const [index, protocol] of (values?.protocols || []).entries()) {
      if (!protocol?.enable) continue;

      const protocolType = protocol.type as ProtocolType;
      const protocolKey = `${protocolType}:${protocol.id || index}:${index}`;
      const fields = PROTOCOL_FIELDS[protocolType] || [];
      const requiredFields = getVisibleRequiredFields(fields, protocol);

      for (const field of requiredFields) {
        const value = protocol[field.name];
        const fieldPath = `protocols.${index}.${field.name}` as any;

        if (field.type === "number") {
          const numericValue =
            typeof value === "number" ? value : Number(value ?? Number.NaN);
          const hasValue = Number.isFinite(numericValue);
          const inMinRange =
            field.min === undefined || numericValue >= field.min;
          const inMaxRange =
            field.max === undefined || numericValue <= field.max;

          if (!(hasValue && inMinRange && inMaxRange)) {
            form.setError(fieldPath, {
              type: "manual",
              message: t(
                "validation.requiredNumberField",
                "{{field}} is required and must be between {{min}} and {{max}}",
                {
                  field: field.label,
                  min: field.min ?? 0,
                  max: field.max ?? 65_535,
                }
              ),
            });
            firstInvalidProtocol ??= protocolKey;
          }
          continue;
        }

        if (field.type === "select") {
          const hasValue = typeof value === "string" && value.trim().length > 0;
          const isAllowed =
            !field.options || (hasValue && field.options.includes(value));

          if (!(hasValue && isAllowed)) {
            form.setError(fieldPath, {
              type: "manual",
              message: t(
                "validation.requiredSelectField",
                "{{field}} is required",
                { field: field.label }
              ),
            });
            firstInvalidProtocol ??= protocolKey;
          }
          continue;
        }

        const hasValue =
          typeof value === "string"
            ? value.trim().length > 0
            : value !== null && value !== undefined;

        if (!hasValue) {
          form.setError(fieldPath, {
            type: "manual",
            message: t("validation.requiredField", "{{field}} is required", {
              field: field.label,
            }),
          });
          firstInvalidProtocol ??= protocolKey;
        }
      }
    }

    if (firstInvalidProtocol) {
      setAccordionValue(firstInvalidProtocol);
      return false;
    }

    return true;
  }

  async function handleSubmit(values: Record<string, any>) {
    form.clearErrors();

    if (!validateEnabledProtocols(values)) {
      return;
    }

    const filteredProtocols: API.Protocol[] = (values?.protocols || []).map(
      (protocol: any) => {
        if (!protocol.enable || protocol.ech_enable === true) {
          return protocol;
        }

        const {
          ech_enable: _ech_enable,
          ech_server_name: _ech_server_name,
          ...rest
        } = protocol;
        return rest;
      }
    );

    const result = {
      name: values.name,
      country: values.country,
      city: values.city,
      address: values.address,
      protocols: preserveUneditableProtocols(
        filteredProtocols,
        initialValues?.protocols
      ),
    };

    const ok = await onSubmit(result);
    if (ok) {
      form.reset();
      setOpen(false);
    }
  }

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <Button
          onClick={() => {
            if (!initialValues) {
              form.reset({
                name: "",
                sort: 0,
                address: "",
                country: "",
                city: "",
                protocols: [],
              });
            }
            setOpen(true);
          }}
        >
          {trigger}
        </Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[700px] max-w-full gap-0 md:max-w-3xl">
            <Sheet.Header>
              <Sheet.Heading>{title}</Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))]">
              <Form {...form}>
                <form className="grid grid-cols-1 gap-2 px-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("name", "Name")}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              onValueChange={(v) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="sort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("sort", "Sort ID")}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              inputMode="numeric"
                              min={0}
                              onValueChange={(v) =>
                                field.onChange(Number(v) || 0)
                              }
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("address", "Address")}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              onValueChange={(v) => field.onChange(v)}
                              placeholder={t(
                                "address_placeholder",
                                "Server address"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("country", "Country")}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              onValueChange={(v) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("city", "City")}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              onValueChange={(v) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="my-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {t(
                          "protocol_configurations",
                          "Protocol Configurations"
                        )}
                      </h3>
                      <p className="mt-1 text-muted text-xs">
                        {t(
                          "protocol_configurations_desc",
                          "Enable and configure the required protocol types"
                        )}
                      </p>
                    </div>
                    <Dropdown>
                      <Dropdown.Trigger
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          class:
                            "inline-flex shrink-0 items-center gap-2 whitespace-nowrap",
                        })}
                        type="button"
                      >
                        <Icon icon="mdi:plus" />
                        {t("add_protocol", "Add")}
                      </Dropdown.Trigger>
                      <Dropdown.Popover placement="bottom end">
                        <Dropdown.Menu aria-label="Actions">
                          {PROTOCOLS.map((type) => (
                            <Dropdown.Item
                              key={type}
                              onAction={() => addProtocolInstance(type)}
                            >
                              {type}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>
                  </div>

                  <Accordion
                    className="w-full space-y-3"
                    expandedKeys={accordionValue ? [accordionValue] : []}
                    onExpandedChange={(keys) =>
                      ((value) =>
                        setAccordionValue(
                          Array.isArray(value) ? value[0] : value
                        ))([...keys].map(String)[0] ?? "")
                    }
                  >
                    {(protocolsValues || []).map((protocol, i) => {
                      const type = protocol?.type as ProtocolType;
                      const current = (protocolsValues[i] || {}) as Record<
                        string,
                        any
                      >;
                      if (!type) return null;
                      const protoId = current.id || i + 1;
                      const itemValue = `${type}:${protoId}:${i}`;
                      const isEnabled = current?.enable;
                      const fields = PROTOCOL_FIELDS[type] || [];
                      return (
                        <AccordionItem
                          className="mb-2 rounded-lg border"
                          id={itemValue}
                          key={itemValue}
                        >
                          <div className="flex min-w-0 items-center gap-2 px-4">
                            <AccordionHeading className="min-w-0 flex-1">
                              <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                                  <div className="flex min-w-0 flex-wrap items-center gap-1">
                                    <Badge
                                      className="text-xs"
                                      variant="secondary"
                                    >
                                      {type}
                                    </Badge>
                                    <span className="min-w-0 font-medium [overflow-wrap:anywhere]">
                                      {current.name
                                        ? `${current.name}#${protoId}`
                                        : `#${protoId}`}
                                    </span>
                                    {current.transport && (
                                      <Badge
                                        className="text-xs"
                                        variant="secondary"
                                      >
                                        {current.transport.toUpperCase()}
                                      </Badge>
                                    )}
                                    {current.security &&
                                      current.security !== "none" && (
                                        <Badge
                                          className="text-xs"
                                          variant="outline"
                                        >
                                          {current.security.toUpperCase()}
                                        </Badge>
                                      )}
                                    {current.port && (
                                      <Badge className="text-xs">
                                        {current.port}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={cn(
                                        "text-xs",
                                        isEnabled
                                          ? "text-success"
                                          : "text-muted"
                                      )}
                                    >
                                      {isEnabled
                                        ? t("enabled", "Enabled")
                                        : t("disabled", "Disabled")}
                                    </span>
                                  </div>
                                </div>
                                <AccordionIndicator />
                              </AccordionTrigger>
                            </AccordionHeading>
                            <div className="flex shrink-0 items-center gap-1">
                              {!(
                                initialValues?.id &&
                                isProtocolUsedInNodes(
                                  initialValues.id,
                                  type,
                                  current.id
                                ) &&
                                isEnabled
                              ) && (
                                <Button
                                  aria-label={t("delete", "Delete")}
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeProtocolInstance(i);
                                  }}
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                >
                                  <Icon className="h-4 w-4" icon="mdi:close" />
                                </Button>
                              )}
                              <Switch
                                aria-label={t("enabled", "Enabled")}
                                checked={!!isEnabled}
                                className="mr-2"
                                disabled={Boolean(
                                  initialValues?.id &&
                                    isProtocolUsedInNodes(
                                      initialValues?.id || 0,
                                      type,
                                      current.id
                                    ) &&
                                    isEnabled
                                )}
                                onCheckedChange={(checked) => {
                                  form.setValue(
                                    `protocols.${i}.enable`,
                                    checked
                                  );
                                  if (checked) {
                                    setAccordionValue(itemValue);
                                    return;
                                  }

                                  if (accordionValue === itemValue) {
                                    setAccordionValue(undefined);
                                  }
                                  form.clearErrors(`protocols.${i}` as any);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <AccordionContent className="px-4 pt-0 pb-4">
                            <div className="-mx-4 space-y-4 rounded-b-lg border-t px-4 pt-4">
                              {current.cert_pin_sha256 && (
                                <div className="space-y-1 text-sm">
                                  <p>
                                    {t(
                                      "certificatePin",
                                      "Certificate SHA-256 Pin"
                                    )}
                                  </p>
                                  <code className="block break-all text-muted">
                                    {current.cert_pin_sha256}
                                  </code>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={control}
                                  name={`protocols.${i}.id`}
                                  render={({ field: fp }) => (
                                    <FormItem>
                                      <FormLabel>ID</FormLabel>
                                      <FormControl>
                                        <EnhancedInput {...fp} disabled />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={control}
                                  name={`protocols.${i}.name`}
                                  render={({ field: fp }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {t("protocol_name", "Name")}
                                      </FormLabel>
                                      <FormControl>
                                        <EnhancedInput
                                          {...fp}
                                          onValueChange={(v) => fp.onChange(v)}
                                          placeholder={t(
                                            "protocol_name_placeholder",
                                            "Display name"
                                          )}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              {renderGroupCard(
                                t("basic", "Basic Configuration"),
                                fields,
                                "basic",
                                control,
                                form,
                                i,
                                current
                              )}
                              {renderGroupCard(
                                t("obfs", "Obfuscation"),
                                fields,
                                "obfs",
                                control,
                                form,
                                i,
                                current
                              )}
                              {renderGroupCard(
                                t("transport", "Transport"),
                                fields,
                                "transport",
                                control,
                                form,
                                i,
                                current
                              )}
                              {renderGroupCard(
                                t("security", "Security"),
                                fields,
                                "security",
                                control,
                                form,
                                i,
                                current
                              )}
                              {renderGroupCard(
                                t("reality", "Reality"),
                                fields,
                                "reality",
                                control,
                                form,
                                i,
                                current
                              )}
                              {renderGroupCard(
                                t("encryption", "Encryption"),
                                fields,
                                "encryption",
                                control,
                                form,
                                i,
                                current
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </form>
              </Form>
            </ScrollArea>
            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                loading={loading}
                onClick={() => setOpen(false)}
                variant="outline"
              >
                {t("cancel", "Cancel")}
              </Button>
              <Button
                loading={loading}
                onClick={form.handleSubmit(handleSubmit, (errors) => {
                  const error = findFirstFormError(errors);
                  if (error?.path[0] === "protocols") {
                    const index = Number(error.path[1]);
                    const protocol = form.getValues("protocols")?.[index];
                    if (protocol) {
                      setAccordionValue(
                        `${protocol.type}:${protocol.id || index + 1}:${index}`
                      );
                    }
                  }
                  toast.danger(
                    error?.message ||
                      t(
                        "validation.invalidForm",
                        "Please check the highlighted fields."
                      )
                  );
                  return false;
                })}
              >
                {t("confirm", "Confirm")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
