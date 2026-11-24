# Dashboard

Dashboard is the homepage of the admin panel, displaying real-time system core data and operational status.

## Page Overview

Dashboard consists of three main areas:

1. **Key Metrics Cards** - 6 core business indicators
2. **Statistics Charts** - Revenue, user, and traffic statistics
3. **Sponsor Display** - Shows PPanel sponsors

## Key Metrics Cards

Top section displays 6 key business metric cards:

### Online Users
- **Display**: Current number of online users
- **Subtitle**: "Currently Online"
- **Click Action**: Jump to `/dashboard/user` user management page
- **Icon**: Blue user icon

### Today's Traffic
- **Display**: Today's total upload + download traffic
- **Subtitle**: Shows upload/download traffic breakdown
  - ↑ Upload traffic
  - ↓ Download traffic
- **Icon**: Purple exchange icon
- **Format**: Auto-converts to appropriate units (KB/MB/GB/TB)

### Monthly Traffic
- **Display**: This month's total upload + download traffic
- **Subtitle**: Shows monthly upload/download traffic breakdown
- **Icon**: Orange cloud data icon
- **Format**: Auto-converts to appropriate units

### Total Servers
- **Display**: Online servers + Offline servers
- **Subtitle**: Shows online/offline server count breakdown
  - "Online X Offline Y"
- **Click Action**: Jump to `/dashboard/servers` server management page
- **Icon**: Green server icon

### Pending Tickets
- **Display**: Number of tickets awaiting admin reply
- **Subtitle**: "Pending"
- **Click Action**: Jump to `/dashboard/ticket` ticket management page
- **Icon**: Red ticket icon

### System Version Info
- **Display**:
  - Backend service version number
  - Web admin version number
  - Version update status
- **Operations**:
  - Check for updates
  - One-click update (if new version available)
  - Restart system
  - View update logs

::: tip Tip
Click cards with links to quickly jump to the corresponding management page.
:::

## Statistics Charts

### Revenue Statistics Chart

Displays system revenue data with three time dimensions:

**Time Dimensions**:
- **Today**: Today's revenue data
- **Month**: Daily revenue trend for this month
- **Total**: Historical cumulative revenue data

**Today's Data** - Pie Chart:
- **New Purchase**: Revenue from new user orders
- **Renewal**: Revenue from renewal orders
- **Recharge**: Paid balance recharge order amounts
- **Redemption**: Actual redemption order amounts; free redemptions contribute zero
- **Center Number**: Today's total revenue

**Month Data** - Bar Chart:
- X-axis: Daily dates
- Y-axis: Revenue amount
- Shows daily revenue bars for the month
- Hover to view detailed data

**Total Data** - Area Chart:
- **New Purchase**: Monthly new purchase revenue
- **Renewal**: Monthly renewal revenue
- **Recharge**: Monthly paid balance recharge amounts
- **Redemption**: Monthly actual redemption order amounts
- Area chart showing long-term trends

**Bottom Summary**:
- Today and Month: total, new purchase, renewal, recharge, and redemption amounts
- Total: total revenue, recharge, and redemption amounts

Recharge orders are classified separately by order type in every summary and daily/monthly trend, regardless of their first-purchase flag. Historical recharge orders use the same classification. Total revenue continues to include paid recharge amounts; purchases paid with the balance are excluded from revenue to avoid counting the same money twice.

### User Statistics Chart

Displays user-related data with three time dimensions:

**Time Dimensions**:
- **Today**: Today's user data
- **Month**: Daily user trend for this month
- **Total**: Historical cumulative user data

**Today's Data** - Pie Chart:
- **Register**: Today's new registered users
- **New Purchase**: Today's first-time buyers, excluding recharges and redemptions
- **Repurchase**: Today's renewal users, excluding recharges and redemptions
- **Recharge**: Distinct users with paid balance recharge orders today
- **Redemption**: Distinct users who redeemed a subscription code today
- **Center Number**: Sum of today's category counts (register + new purchase + repurchase + recharge + redemption)

Multiple recharge orders by one user count once per period. A user who both recharges and purchases or renews counts in each applicable category.

Redemptions have a separate category in today's, monthly, and lifetime summaries and daily/monthly trends. Multiple redemptions by the same user count once per period; users who both purchase and redeem count in each applicable category. Historical redemption orders are classified by order type regardless of their original first-purchase flag. Redemption does not consume eligibility for a subsequent first paid purchase. Free redemptions contribute zero revenue; the plan's list price is not added to revenue.

**Month Data** - Bar Chart:
- X-axis: Daily dates
- Y-axis: User count
- Five category series:
  - Registered users
  - New purchase users
  - Renewal users
  - Recharge users
  - Redemption users

**Total Data** - Area Chart:
- **Registered Users**: Cumulative registration trend
- **New Purchase Users**: Cumulative new purchase trend
- **Renewal Users**: Cumulative renewal trend
- **Recharge Users**: Cumulative recharge trend
- **Redemption Users**: Cumulative redemption trend
- Five area curves showing long-term changes

**Bottom Summary**:
- Today and Month: registered, new purchase, renewal, recharge, and redemption user counts
- Total: registered, recharge, and redemption user totals

### Traffic Ranking Chart

Displays node or user traffic usage ranking:

**Time Toggle** (top-right tabs):
- **Today**: Today's traffic ranking
- **Yesterday**: Yesterday's traffic ranking

**Type Selection** (dropdown):
- **Node Traffic (Nodes)**: Shows server node traffic consumption ranking
- **User Traffic (Users)**: Shows user traffic usage ranking

**Chart Display** - Horizontal Bar Chart:
- Y-axis: Ranking number (1, 2, 3...)
- X-axis: Traffic size (auto-converts units)
- Bars: Traffic size visualization
- Bar Labels: Shows node name or user ID

**Interactions**:
- Hover: Display detailed traffic data
- Node Mode: Shows node name and traffic
- User Mode: Shows user subscription details (ID, package, expiry, etc.)

**Empty State**:
- Shows empty state message when no data

::: tip Traffic Calculation
Traffic = Upload traffic + Download traffic, automatically converted to KB/MB/GB/TB units.
:::

## Sponsor Display

Bottom of page shows sponsors supporting the PPanel project:

**Display Content**:
- Sponsor logo
- Sponsor name
- Brief description

**Data Source**:
- Fetches latest sponsor list from GitHub repository
- CDN accelerated access
- Auto-filters expired sponsors

**Interaction**:
- Click card to visit sponsor website
- Opens in new window

::: tip Support PPanel
Sponsoring helps PPanel continue releasing updates! Click sponsor cards to visit their services.
:::

## Data Refresh

- **Auto Refresh**: Page data updates automatically based on query configuration
- **Manual Refresh**: Refresh browser to immediately update all data
- **Real-time**: Key metrics fetch latest data in real-time

## Usage Recommendations

1. **Daily Review**: Check Dashboard daily to understand operational status
2. **Monitor Metrics**: Focus on real-time indicators like online users and pending tickets
3. **Trend Analysis**: Regularly review chart trends to analyze business changes
4. **Handle Anomalies**: Click cards to jump and handle issues when detecting data anomalies
5. **Version Updates**: Update system promptly when new version is available

## Troubleshooting

### Inaccurate Data?

1. Refresh browser page to re-fetch data
2. Check if server time is correct
3. Review system logs for errors

### Chart Showing Empty?

Revenue and user statistics show an empty state for **Today** when every metric is zero, and for **Month** or **Total** when the API list is missing or empty. With data available, charts should render on desktop and mobile without a page refresh when switching time periods.

If the bottom summary contains data but the chart area is completely blank (rather than showing the empty-state message), update the admin panel and refresh the page. Today's charts need explicit container dimensions to prevent them from collapsing to zero inside the card's column flex layout.

If the empty state remains after updating, check whether the selected period contains data and whether the statistics service is working.

### Sponsors Not Showing?

Possible causes:
- Network connection issue, cannot access CDN
- No valid sponsors in current period
- Browser blocking external resources

## Next Steps

- [User Management](/admin/users-support/users) - View user details and traffic usage
- [Ticket Management](/admin/users-support/tickets) - Handle pending tickets
- [Server Management](/admin/maintenance/servers) - Manage server nodes
- [Order Management](/admin/commerce/orders) - View revenue and order details
