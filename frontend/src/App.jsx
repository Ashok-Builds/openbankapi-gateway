import { useState, useCallback } from 'react'
import axios from 'axios'
import {
  Box, Card, CardContent, Grid, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Stack,
  CircularProgress, Alert, Divider, LinearProgress, Avatar, Typography
} from '@mui/material'
import {
  AccountBalance, Receipt, Payment, Refresh, FlashOn,
  CheckCircle, Cancel, Warning, TrendingUp, TrendingDown,
  Shield, Speed, BarChart, GridView, Hub, ArrowUpward,
  ArrowDownward, Circle, Security, BugReport
} from '@mui/icons-material'
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// ── THEME ─────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#635BFF', light: '#7B74FF', dark: '#4B44CC' },
    secondary:  { main: '#0A2540' },
    success:    { main: '#0D7A4E' },
    warning:    { main: '#B54708' },
    error:      { main: '#C4162A' },
    background: { default: '#F6F8FA', paper: '#FFFFFF' },
    text:       { primary: '#0A2540', secondary: '#425466', disabled: '#8898AA' },
    divider:    '#E3E8EE',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h6:  { fontWeight: 600, color: '#0A2540' },
    body2: { color: '#425466', fontSize: '0.875rem' },
    caption: { color: '#8898AA', fontSize: '0.75rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { background: '#F6F8FA' },
        '*::-webkit-scrollbar': { width: '5px' },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '3px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#FFFFFF', border: '1px solid #E3E8EE', borderRadius: 10,
          boxShadow: '0 1px 3px rgba(10,37,64,0.04)',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': { boxShadow: '0 4px 16px rgba(10,37,64,0.08)', borderColor: '#C9D4E0' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, fontSize: '0.825rem' },
        containedPrimary: { background: '#635BFF', boxShadow: '0 2px 8px rgba(99,91,255,0.3)', '&:hover': { background: '#4B44CC' } },
        outlinedPrimary:  { borderColor: '#D0D5DD', color: '#0A2540', '&:hover': { background: '#F6F8FA', borderColor: '#98A2B3' } },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 600, fontSize: '0.72rem' } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#8898AA', background: '#F6F8FA', borderBottom: '1px solid #E3E8EE', padding: '10px 16px' },
        body: { fontSize: '0.825rem', color: '#425466', padding: '11px 16px', borderBottom: '1px solid #F0F4F8' },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { '&:hover td': { background: '#F9FAFB' }, '&:last-child td': { borderBottom: 'none' } } },
    },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, height: 5, background: '#EEF2F7' } } },
    MuiDivider:        { styleOverrides: { root: { borderColor: '#E3E8EE' } } },
    MuiAlert:          { styleOverrides: { root: { borderRadius: 8, fontSize: '0.8rem' } } },
  },
})

// ── CONSTANTS ─────────────────────────────────────────────────────────────
const GATEWAY   = '/api/gateway/banking/1.0.0'
const TOKEN_URL = '/api/token/oauth2/token'
const SIDEBAR_W = 228

const fmt      = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtShort = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`

// ── TEST DATA ─────────────────────────────────────────────────────────────
const TEST_COLLECTIONS = [
  {
    id: 'security',
    name: 'openBankApiSecurity-tests',
    description: 'Gateway security — OAuth2, scopes, rate limiting, field masking',
    postmanId: '5a19c687-104b-411a-9535-58cecd50d592',
    color: '#C4162A',
    bgColor: alpha('#C4162A', 0.06),
    icon: '🔐',
    tests: [
      { id: 'ST-01', name: 'fintech app bearer token',       method: 'POST', endpoint: '/oauth2/token',                    expected: '200 OK',                  status: 'PASS', actual: '200 OK',            note: 'Token generated successfully with all 4 scopes' },
      { id: 'ST-02', name: '1 — Valid token GET accounts',   method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '200 OK',                  status: 'PASS', actual: '200 OK',            note: 'Valid Bearer token accepted by WSO2 gateway' },
      { id: 'ST-03', name: '2 — No token',                   method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '401 Unauthorized',         status: 'PASS', actual: '401 Unauthorized',  note: 'Missing Authorization header blocked correctly' },
      { id: 'ST-04', name: '3 — Invalid token',              method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '401 Unauthorized',         status: 'PASS', actual: '401 Unauthorized',  note: 'Tampered JWT token rejected by gateway' },
      { id: 'ST-05', name: '4 — Wrong scope',                method: 'GET',  endpoint: '/banking/1.0.0/payments/initiate', expected: '403 Forbidden',            status: 'PASS', actual: '403 Forbidden',     note: 'SandboxApp missing payments:write scope blocked' },
      { id: 'ST-06', name: '5 — Rate limit exceeded',        method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '429 Too Many Requests',    status: 'PASS', actual: '429 Too Many Requests', note: 'SandboxApp 6th request blocked — 5/min limit hit' },
      { id: 'ST-07', name: '6 — Missing required fields',    method: 'POST', endpoint: '/banking/1.0.0/payments/initiate', expected: '400 Bad Request',          status: 'PASS', actual: '400 Bad Request',   note: 'Payment missing account_to and amount rejected' },
      { id: 'ST-08', name: '7 — internal_ref field stripped', method: 'GET', endpoint: '/banking/1.0.0/accounts',          expected: 'internal_ref absent',      status: 'PASS', actual: 'Field not present', note: 'WSO2 mediation policy stripped internal_ref successfully' },
    ],
  },
  {
    id: 'gateway',
    name: 'openBankGateway-tests',
    description: 'All API endpoint tests — Accounts, Transactions, Payments',
    postmanId: 'e8a2c156-6f33-4926-aec0-5ac9ea7451cb',
    color: '#635BFF',
    bgColor: alpha('#635BFF', 0.06),
    icon: '⚡',
    tests: [
      { id: 'GT-01', name: 'fintech app bearer token',  method: 'POST', endpoint: '/oauth2/token',                          expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: 'FintechApp client credentials token generated' },
      { id: 'GT-02', name: 'accounts',                  method: 'GET',  endpoint: '/banking/1.0.0/accounts',                expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: '3 accounts returned — internal_ref stripped' },
      { id: 'GT-03', name: 'accounts-id',               method: 'GET',  endpoint: '/banking/1.0.0/accounts/ACC001',         expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: 'Single account by ID returned correctly' },
      { id: 'GT-04', name: 'accounts-id-balance',       method: 'GET',  endpoint: '/banking/1.0.0/accounts/ACC001/balance', expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: 'Account balance returned — ₹45,000' },
      { id: 'GT-05', name: 'transactions',              method: 'GET',  endpoint: '/banking/1.0.0/transactions',            expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: '5 transactions returned' },
      { id: 'GT-06', name: 'transactions-id',           method: 'GET',  endpoint: '/banking/1.0.0/transactions/TXN001',     expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: 'Single transaction by ID returned' },
      { id: 'GT-07', name: 'transactions-filter',       method: 'POST', endpoint: '/banking/1.0.0/transactions/filter',     expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: 'Filtered by account_id — correct subset returned' },
      { id: 'GT-08', name: 'payments-initiate',         method: 'POST', endpoint: '/banking/1.0.0/payments/initiate',       expected: '201 Created', status: 'PASS', actual: '201 Created', note: 'Payment initiated — PAY ID generated' },
      { id: 'GT-09', name: 'payments-status',           method: 'GET',  endpoint: '/banking/1.0.0/payments/PAY001/status',  expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: 'Payment status returned — Completed' },
      { id: 'GT-10', name: 'payments-cancel',           method: 'POST', endpoint: '/banking/1.0.0/payments/cancel',         expected: '200 OK',  status: 'PASS', actual: '200 OK',  note: 'Pending payment cancelled successfully' },
    ],
  },
  {
    id: 'versioning',
    name: 'openBankVersioning-tests',
    description: 'API versioning — v1 owner field vs v2 account_holder field',
    postmanId: '2ec05ffd-cc60-4dc8-a14a-05de60cbcdec',
    color: '#0D7A4E',
    bgColor: alpha('#0D7A4E', 0.06),
    icon: '🔀',
    tests: [
      { id: 'VT-01', name: 'fintech app bearer token', method: 'POST', endpoint: '/oauth2/token',                       expected: '200 OK',              status: 'PASS', actual: '200 OK',              note: 'Token generated with all scopes for versioning test' },
      { id: 'VT-02', name: 'version1-with product',   method: 'GET',  endpoint: '/banking/1.0.0/accounts',             expected: '200 OK · owner field', status: 'PASS', actual: '200 OK · owner field', note: 'v1 returns { "owner": "Rahul Sharma" } — existing consumers unaffected' },
      { id: 'VT-03', name: 'version2-direct api',     method: 'GET',  endpoint: '/banking/2.0.0/accounts',             expected: '200 OK · account_holder field', status: 'PASS', actual: '200 OK · account_holder field', note: 'v2 returns { "account_holder": "Rahul Sharma" } — breaking change on new version only' },
    ],
  },
]

// ── REUSABLE COMPONENTS ───────────────────────────────────────────────────
const MonoChip = ({ label }) => (
  <Chip label={label} size="small" sx={{
    fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem',
    background: '#F0F4F8', color: '#64748B', border: '1px solid #E2E8F0',
    height: 20, borderRadius: '4px', fontWeight: 500,
  }} />
)

const StatusBadge = ({ status }) => {
  const cfg = {
    Completed: { color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
    Pending:   { color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' },
    Cancelled: { color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
  }
  const c = cfg[status] || cfg.Pending
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: '20px', background: c.bg }}>
      <Circle sx={{ fontSize: 7, color: c.dot }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: c.color }}>{status}</Typography>
    </Box>
  )
}

const PassBadge = ({ status }) => {
  const isPass = status === 'PASS'
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: '20px', background: isPass ? '#D1FAE5' : '#FEE2E2' }}>
      {isPass
        ? <CheckCircle sx={{ fontSize: 11, color: '#10B981' }} />
        : <Cancel sx={{ fontSize: 11, color: '#EF4444' }} />}
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: isPass ? '#065F46' : '#991B1B' }}>{status}</Typography>
    </Box>
  )
}

const MethodChip = ({ method }) => {
  const colors = { GET: { bg: '#DBEAFE', color: '#1E40AF' }, POST: { bg: '#D1FAE5', color: '#065F46' }, PUT: { bg: '#FEF3C7', color: '#92400E' }, DELETE: { bg: '#FEE2E2', color: '#991B1B' } }
  const c = colors[method] || colors.GET
  return (
    <Box sx={{ display: 'inline-flex', px: 1, py: 0.3, borderRadius: '4px', background: c.bg }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: c.color, fontFamily: '"JetBrains Mono", monospace' }}>{method}</Typography>
    </Box>
  )
}

const SectionHeader = ({ title, subtitle, action }) => (
  <Box mb={3}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2540', mb: 0.3 }}>{title}</Typography>
        {subtitle && <Typography variant="body2" sx={{ color: '#8898AA', fontSize: '0.825rem' }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Stack>
  </Box>
)

const StatCard = ({ label, value, sub, icon, color, trend }) => (
  <Card>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>{label}</Typography>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.5px', lineHeight: 1, mb: 0.5 }}>{value}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#8898AA' }}>{sub}</Typography>
        </Box>
        <Avatar sx={{ width: 40, height: 40, background: alpha(color, 0.1), borderRadius: 2, color }}>
          {icon}
        </Avatar>
      </Stack>
      {trend && (
        <Stack direction="row" alignItems="center" spacing={0.4} mt={1.5} pt={1.5} sx={{ borderTop: '1px solid #F0F4F8' }}>
          {trend > 0
            ? <ArrowUpward sx={{ fontSize: 13, color: '#0D7A4E' }} />
            : <ArrowDownward sx={{ fontSize: 13, color: '#C4162A' }} />}
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: trend > 0 ? '#0D7A4E' : '#C4162A' }}>{Math.abs(trend)}%</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>from last period</Typography>
        </Stack>
      )}
    </CardContent>
  </Card>
)

// ── TESTS PAGE ────────────────────────────────────────────────────────────
const TestsPage = () => {
  const [activeCollection, setActiveCollection] = useState('all')

  const allTests        = TEST_COLLECTIONS.flatMap(c => c.tests)
  const totalTests      = allTests.length
  const passedTests     = allTests.filter(t => t.status === 'PASS').length
  const failedTests     = totalTests - passedTests
  const passRate        = Math.round((passedTests / totalTests) * 100)

  const collectionsToShow = activeCollection === 'all'
    ? TEST_COLLECTIONS
    : TEST_COLLECTIONS.filter(c => c.id === activeCollection)

  return (
    <Box>
      <SectionHeader 
        title="Test Results"
        subtitle="Postman collections — security tests, gateway endpoint tests, versioning tests"
      />

      {/* Summary Stats */}
      <Grid container spacing={2} mb={3} >
        <Grid item xs={12} sm={3}>
          <StatCard label="Total Tests" value={totalTests} sub="Across 3 collections" icon={<BugReport sx={{ fontSize: 20 }} />} color="#635BFF" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard label="Tests Passed" value={passedTests} sub="All scenarios green" icon={<CheckCircle sx={{ fontSize: 20 }} />} color="#0D7A4E" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard label="Tests Failed" value={failedTests} sub={failedTests === 0 ? 'No failures' : 'Review required'} icon={<Cancel sx={{ fontSize: 20 }} />} color={failedTests === 0 ? '#8898AA' : '#C4162A'} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard label="Pass Rate" value={`${passRate}%`} sub="3 collections tested" icon={<Shield sx={{ fontSize: 20 }} />} color="#0D7A4E" />
        </Grid>
      </Grid>

      {/* Collection tabs */}
      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
        {[
          { id: 'all', label: 'All Collections', count: totalTests, color: '#635BFF' },
          ...TEST_COLLECTIONS.map(c => ({ id: c.id, label: c.name, count: c.tests.length, color: c.color })),
        ].map(tab => (
          <Box key={tab.id}
            onClick={() => setActiveCollection(tab.id)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8,
              borderRadius: 2, cursor: 'pointer', border: '1px solid',
              borderColor: activeCollection === tab.id ? tab.color : '#E3E8EE',
              background: activeCollection === tab.id ? alpha(tab.color, 0.06) : '#FFFFFF',
              transition: 'all 0.15s',
              '&:hover': { borderColor: tab.color, background: alpha(tab.color, 0.04) },
            }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: activeCollection === tab.id ? tab.color : '#425466' }}>
              {tab.label}
            </Typography>
            <Chip label={tab.count} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, background: activeCollection === tab.id ? alpha(tab.color, 0.12) : '#F0F4F8', color: activeCollection === tab.id ? tab.color : '#8898AA', borderRadius: '10px', minWidth: 24 }} />
          </Box>
        ))}
      </Stack>

      {/* Collection tables */}
      {collectionsToShow.map(collection => (
        <Card key={collection.id} sx={{ mb: 2.5 ,mt:4}}>

          {/* Collection header */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE', background: collection.bgColor }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography sx={{ fontSize: 18 }}>{collection.icon}</Typography>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A2540', fontFamily: '"JetBrains Mono", monospace' }}>
                    {collection.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#8898AA', mt: 0.2 }}>
                    {collection.description}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${collection.tests.filter(t => t.status === 'PASS').length}/${collection.tests.length} passed`}
                  size="small"
                  sx={{ background: alpha('#0D7A4E', 0.1), color: '#0D7A4E', border: 'none', fontSize: '0.72rem', fontWeight: 700 }}
                />
                <Typography sx={{ fontSize: '0.68rem', color: '#8898AA', fontFamily: '"JetBrains Mono", monospace' }}>
                  ID: {collection.postmanId.split('-')[0]}...
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Tests table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>ID</TableCell>
                  <TableCell>Test Name</TableCell>
                  <TableCell sx={{ width: 60 }}>Method</TableCell>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Expected</TableCell>
                  <TableCell>Actual</TableCell>
                  <TableCell sx={{ width: 80 }}>Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collection.tests.map(test => (
                  <TableRow key={test.id} sx={{ '&:hover td': { background: '#F9FAFB' } }}>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace', color: collection.color, fontWeight: 600 }}>{test.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem', fontWeight: 500, color: '#0A2540' }}>{test.name}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#8898AA', mt: 0.3 }}>{test.note}</Typography>
                    </TableCell>
                    <TableCell><MethodChip method={test.method} /></TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: '#425466' }}>{test.endpoint}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: '#64748B' }}>{test.expected}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: '#0A2540', fontWeight: 500 }}>{test.actual}</Typography>
                    </TableCell>
                    <TableCell><PassBadge status={test.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ))}
    </Box>
  )
}

// ── OTHER PAGES ───────────────────────────────────────────────────────────
const OverviewPage = ({ accounts, transactions, credits, debits, creditTotal, debitTotal, totalBal, reqCount }) => {
  const maxBal = Math.max(...accounts.map(a => a.balance), 1)
  const acctColors = [
    { bar: '#635BFF', value: '#635BFF', bg: alpha('#635BFF', 0.06) },
    { bar: '#0D7A4E', value: '#0D7A4E', bg: alpha('#0D7A4E', 0.06) },
    { bar: '#B54708', value: '#B54708', bg: alpha('#B54708', 0.06) },
  ]
  const totalTests  = TEST_COLLECTIONS.flatMap(c => c.tests).length
  const passedTests = TEST_COLLECTIONS.flatMap(c => c.tests).filter(t => t.status === 'PASS').length

  return (
    <Box>
      <SectionHeader  title="Overview" subtitle="Summary of all accounts, transactions, payments and test results" />
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Balance"    value={accounts.length ? fmtShort(totalBal) : '—'}    sub={accounts.length ? fmt(totalBal) : 'No data'} icon={<AccountBalance sx={{ fontSize: 20 }} />} color="#635BFF" trend={4.2} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Credits"    value={credits.length  ? fmtShort(creditTotal) : '—'} sub={`${credits.length} transactions`}              icon={<TrendingUp     sx={{ fontSize: 20 }} />} color="#0D7A4E" trend={12.5} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Debits"     value={debits.length   ? fmtShort(debitTotal) : '—'}  sub={`${debits.length} transactions`}               icon={<TrendingDown   sx={{ fontSize: 20 }} />} color="#C4162A" trend={-3.1} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Tests Passing"    value={`${passedTests}/${totalTests}`}                sub="3 Postman collections"                         icon={<CheckCircle    sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
      </Grid>

      {accounts.length > 0 && (
        <Card sx={{ mb: 2.5 , mt: 4}}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Account Balances</Typography>
              <MonoChip label="accounts:read" />
            </Stack>
          </Box>
          <CardContent sx={{ p: 0 }}>
            {accounts.map((acc, i) => {
              const c = acctColors[i % 3]
              return (
                <Box key={acc.id} sx={{ px: 2.5, py: 1.8, borderBottom: i < accounts.length - 1 ? '1px solid #F0F4F8' : 'none', '&:hover': { background: '#FAFBFC' } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ width: 36, height: 36, background: c.bg, color: c.value, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700 }}>{acc.id.slice(-3)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Box>
                          <Typography sx={{ fontSize: '0.825rem', fontWeight: 600, color: '#0A2540' }}>{acc.owner || acc.account_holder}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>{acc.id} · {acc.type} · {acc.currency}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0A2540' }}>{fmt(acc.balance)}</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={(acc.balance / maxBal) * 100} sx={{ '& .MuiLinearProgress-bar': { background: c.bar } }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: c.value, minWidth: 40, textAlign: 'right' }}>{Math.round((acc.balance / totalBal) * 100)}%</Typography>
                  </Stack>
                </Box>
              )
            })}
          </CardContent>
        </Card>
      )}

      {transactions.length > 0 && (
        <Card>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Recent Transactions</Typography>
              <MonoChip label="transactions:read" />
            </Stack>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Description</TableCell><TableCell>Account</TableCell><TableCell>Type</TableCell><TableCell align="right">Amount</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
              <TableBody>
                {transactions.slice(0, 5).map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem', fontWeight: 500, color: '#0A2540' }}>{txn.description}</Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#CBD5E0', fontFamily: '"JetBrains Mono", monospace' }}>{txn.id}</Typography>
                    </TableCell>
                    <TableCell><MonoChip label={txn.account_id} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: '20px', background: txn.type === 'Credit' ? alpha('#0D7A4E', 0.08) : alpha('#C4162A', 0.08) }}>
                        {txn.type === 'Credit' ? <ArrowUpward sx={{ fontSize: 11, color: '#0D7A4E' }} /> : <ArrowDownward sx={{ fontSize: 11, color: '#C4162A' }} />}
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: txn.type === 'Credit' ? '#0D7A4E' : '#C4162A' }}>{txn.type}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: '0.825rem', fontWeight: 700, color: txn.type === 'Credit' ? '#0D7A4E' : '#C4162A', fontFamily: '"JetBrains Mono", monospace' }}>
                        {txn.type === 'Credit' ? '+' : '-'}{fmt(txn.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.75rem', color: '#8898AA' }}>{txn.date}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  )
}

const AccountsPage = ({ accounts, totalBal }) => {
  const maxBal = Math.max(...accounts.map(a => a.balance), 1)
  const acctColors = [
    { bar: '#635BFF', value: '#635BFF', bg: alpha('#635BFF', 0.06), border: alpha('#635BFF', 0.15) },
    { bar: '#0D7A4E', value: '#0D7A4E', bg: alpha('#0D7A4E', 0.06), border: alpha('#0D7A4E', 0.15) },
    { bar: '#B54708', value: '#B54708', bg: alpha('#B54708', 0.06), border: alpha('#B54708', 0.15) },
  ]
  return (
    <Box>
      <SectionHeader title="Accounts" subtitle="All bank accounts with real-time balances via WSO2 gateway" action={<MonoChip label="GET /accounts" />} />
      {accounts.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <AccountBalance sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} />
          <Typography color="text.secondary">Generate a token to load account data</Typography>
        </Card>
      ) : (
        <>
          <Grid container spacing={2} mb={3} >
            {accounts.map((acc, i) => {
              const c = acctColors[i % 3]
              return (
                <Grid item xs={12} sm={4} key={acc.id}>
                  <Card sx={{ border: `1px solid ${c.border}` }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Avatar sx={{ width: 42, height: 42, background: c.bg, color: c.value, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700 }}>{acc.id.slice(-3)}</Avatar>
                        <Chip label={acc.type} size="small" sx={{ background: c.bg, color: c.value, border: `1px solid ${c.border}`, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }} />
                      </Stack>
                      <Typography sx={{ fontSize: '0.72rem', color: '#8898AA', mb: 0.3, fontFamily: '"JetBrains Mono", monospace' }}>{acc.id}</Typography>
                      <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.5px', mb: 0.3 }}>{fmt(acc.balance)}</Typography>
                      <Typography sx={{ fontSize: '0.825rem', color: '#425466', mb: 2 }}>{acc.owner || acc.account_holder}</Typography>
                      <Divider sx={{ mb: 1.5 }} />
                      <Stack direction="row" justifyContent="space-between" mb={0.8}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>Portfolio share</Typography>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: c.value }}>{Math.round((acc.balance / totalBal) * 100)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={(acc.balance / maxBal) * 100} sx={{ '& .MuiLinearProgress-bar': { background: c.bar } }} />
                      <Stack direction="row" justifyContent="space-between" mt={1.5}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>Currency</Typography>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#425466', fontFamily: '"JetBrains Mono", monospace' }}>{acc.currency}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
          <Card sx={{my:4} }>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}><Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Account Summary</Typography></Box>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Account ID</TableCell><TableCell>Account Holder</TableCell><TableCell>Type</TableCell><TableCell>Currency</TableCell><TableCell align="right">Balance</TableCell><TableCell align="right">Share</TableCell></TableRow></TableHead>
                <TableBody>
                  {accounts.map((acc, i) => (
                    <TableRow key={acc.id}>
                      <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', color: '#0A2540', fontWeight: 500 }}>{acc.id}</TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.825rem', fontWeight: 500, color: '#0A2540' }}>{acc.owner || acc.account_holder}</Typography></TableCell>
                      <TableCell><Chip label={acc.type} size="small" sx={{ background: alpha(acctColors[i%3].value, 0.08), color: acctColors[i%3].value, border: 'none', fontSize: '0.7rem', fontWeight: 600 }} /></TableCell>
                      <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{acc.currency}</TableCell>
                      <TableCell align="right"><Typography sx={{ fontWeight: 700, color: '#0A2540', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.825rem' }}>{fmt(acc.balance)}</Typography></TableCell>
                      <TableCell align="right"><Typography sx={{ fontWeight: 600, color: acctColors[i%3].value, fontSize: '0.825rem' }}>{Math.round((acc.balance / totalBal) * 100)}%</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  )
}

const TransactionsPage = ({ transactions, credits, debits, creditTotal, debitTotal }) => (
  <Box>
    <SectionHeader title="Transactions" subtitle="Full transaction ledger with credit and debit history" action={<MonoChip label="GET /transactions" />} />
    {transactions.length === 0 ? (
      <Card sx={{ textAlign: 'center', py: 6 }}><Receipt sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} /><Typography color="text.secondary">Generate a token to load transactions</Typography></Card>
    ) : (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}><StatCard label="Total Transactions" value={transactions.length} sub="All records loaded"    icon={<Receipt sx={{ fontSize: 20 }} />}      color="#635BFF" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Total Credits"      value={fmt(creditTotal)}    sub={`${credits.length} credit entries`} icon={<ArrowUpward sx={{ fontSize: 20 }} />}  color="#0D7A4E" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Total Debits"       value={fmt(debitTotal)}     sub={`${debits.length} debit entries`}  icon={<ArrowDownward sx={{ fontSize: 20 }} />} color="#C4162A" /></Grid>
        </Grid>
        <Card sx={{my:4}}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>All Transactions</Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={`${credits.length} Credits`} size="small" sx={{ background: alpha('#0D7A4E', 0.08), color: '#0D7A4E', border: 'none', fontSize: '0.7rem', fontWeight: 600 }} />
                <Chip label={`${debits.length} Debits`}   size="small" sx={{ background: alpha('#C4162A', 0.08), color: '#C4162A', border: 'none', fontSize: '0.7rem', fontWeight: 600 }} />
              </Stack>
            </Stack>
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow><TableCell>Transaction ID</TableCell><TableCell>Description</TableCell><TableCell>Account</TableCell><TableCell>Type</TableCell><TableCell align="right">Amount</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
              <TableBody>
                {transactions.map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: '#635BFF', fontWeight: 500 }}>{txn.id}</TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.825rem', fontWeight: 500, color: '#0A2540' }}>{txn.description}</Typography></TableCell>
                    <TableCell><MonoChip label={txn.account_id} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: '20px', background: txn.type === 'Credit' ? alpha('#0D7A4E', 0.08) : alpha('#C4162A', 0.08) }}>
                        {txn.type === 'Credit' ? <ArrowUpward sx={{ fontSize: 11, color: '#0D7A4E' }} /> : <ArrowDownward sx={{ fontSize: 11, color: '#C4162A' }} />}
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: txn.type === 'Credit' ? '#0D7A4E' : '#C4162A' }}>{txn.type}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right"><Typography sx={{ fontWeight: 700, color: txn.type === 'Credit' ? '#0D7A4E' : '#C4162A', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.825rem' }}>{txn.type === 'Credit' ? '+' : '-'}{fmt(txn.amount)}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.75rem', color: '#8898AA' }}>{txn.date}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </>
    )}
  </Box>
)

const PaymentsPage = ({ payments }) => (
  <Box>
    <SectionHeader title="Payments" subtitle="Payment initiation, status tracking and cancellation" action={<MonoChip label="GET /payments/:id/status" />} />
    {payments.length === 0 ? (
      <Card sx={{ textAlign: 'center', py: 6 }}><Payment sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} /><Typography color="text.secondary">Generate a token to load payment data</Typography></Card>
    ) : (
      <>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}><StatCard label="Total Payments" value={payments.length}                                         sub="Records loaded"         icon={<Payment      sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Completed"      value={payments.filter(p => p.status === 'Completed').length} sub="Successful payments"     icon={<CheckCircle  sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Pending"        value={payments.filter(p => p.status === 'Pending').length}   sub="Awaiting processing"     icon={<Warning      sx={{ fontSize: 20 }} />} color="#B54708" /></Grid>
        </Grid>
        <Card sx={{my:4}}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Payment Records</Typography>
              <Stack direction="row" spacing={1}><MonoChip label="payments:read" /><MonoChip label="payments:write" /></Stack>
            </Stack>
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow><TableCell>Payment ID</TableCell><TableCell>From</TableCell><TableCell>To</TableCell><TableCell align="right">Amount</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {payments.map(pay => (
                  <TableRow key={pay.id}>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', color: '#635BFF', fontWeight: 500 }}>{pay.id}</TableCell>
                    <TableCell><MonoChip label={pay.from || pay.account_from || '—'} /></TableCell>
                    <TableCell><MonoChip label={pay.to   || pay.account_to   || '—'} /></TableCell>
                    <TableCell align="right"><Typography sx={{ fontWeight: 700, color: '#0A2540', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.825rem' }}>{fmt(pay.amount)}</Typography></TableCell>
                    <TableCell><StatusBadge status={pay.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </>
    )}
  </Box>
)

const GatewayPage = ({ reqCount, token }) => {
  const rows = [
    { section: 'Endpoints',   items: [['Gateway URL', ':8243 (HTTPS)', '#635BFF'], ['Management URL', ':9443', '#635BFF'], ['Token Endpoint', '/oauth2/token', '#635BFF']] },
    { section: 'Security',    items: [['Auth Method', 'OAuth2 JWT', '#0D7A4E'], ['Scopes Active', '4 scopes', '#0D7A4E'], ['Field Masking', 'internal_ref stripped', '#0D7A4E'], ['Token Type', 'Bearer JWT', '#0D7A4E']] },
    { section: 'Rate Limits', items: [['Sandbox Tier', '5 req/min → 429', '#B54708'], ['Standard Tier', '50 req/min', '#B54708'], ['Premium Tier', '500 req/min', '#B54708']] },
    { section: 'Performance', items: [['Response Cache', '300s TTL', '#635BFF'], ['Cache Improvement', '12× faster (200ms→17ms)', '#635BFF'], ['Versioning', 'v1.0.0 + v2.0.0 live', '#635BFF']] },
    { section: 'Backends',    items: [['Accounts v1', 'Node.js port 3001 · owner field', '#0D7A4E'], ['Accounts v2', 'Node.js port 3004 · account_holder field', '#0D7A4E'], ['Transactions', 'Node.js port 3002', '#0D7A4E'], ['Payments', 'Node.js port 3003', '#0D7A4E']] },
  ]
  return (
    <Box>
      <SectionHeader title="Gateway Configuration" subtitle="WSO2 API Manager 4.6 gateway settings and performance metrics" />
      <Grid container spacing={2} mb={3} >
        <Grid item xs={12} sm={3}><StatCard label="Gateway Calls"  value={reqCount}             sub="This session"       icon={<BarChart   sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Auth Status"    value={token ? 'Active' : 'No Token'} sub="OAuth2 JWT"  icon={<Security   sx={{ fontSize: 20 }} />} color={token ? '#0D7A4E' : '#8898AA'} /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Cache TTL"      value="300s"                 sub="12× performance"    icon={<Speed      sx={{ fontSize: 20 }} />} color="#B54708" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="API Versions"   value="2 live"               sub="v1.0.0 + v2.0.0"   icon={<Hub        sx={{ fontSize: 20 }} />} color="#0EA5E9" /></Grid>
      </Grid>
      {rows.map(({ section, items }) => (
        <Card key={section} sx={{ mb: 2, my:4}}>
          <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid #E3E8EE', background: '#FAFBFC' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#425466', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{section}</Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            {items.map(([label, value, color], j) => (
              <Stack key={j} direction="row" justifyContent="space-between" alignItems="center"
                sx={{ px: 2.5, py: 1.5, borderBottom: j < items.length - 1 ? '1px solid #F0F4F8' : 'none', '&:hover': { background: '#FAFBFC' } }}>
                <Typography sx={{ fontSize: '0.825rem', color: '#425466' }}>{label}</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color, fontFamily: '"JetBrains Mono", monospace' }}>{value}</Typography>
              </Stack>
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [token,        setToken]        = useState('')
  const [tokenLoading, setTokLoad]      = useState(false)
  const [accounts,     setAccounts]     = useState([])
  const [transactions, setTransactions] = useState([])
  const [payments,     setPayments]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [tokenError,   setTokenError]   = useState('')
  const [refreshTime,  setRefreshTime]  = useState(null)
  const [reqCount,     setReqCount]     = useState(0)
  const [activePage,   setActivePage]   = useState('overview')

  const generateToken = async () => {
    setTokLoad(true); setTokenError('')
    try {
      const p = new URLSearchParams()
      p.append('grant_type', 'client_credentials')
      p.append('scope', 'accounts:read transactions:read payments:read payments:write')
      const r = await axios.post(TOKEN_URL, p, {
        auth: { username: import.meta.env.VITE_CLIENT_ID || '', password: import.meta.env.VITE_CLIENT_SECRET || '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      setToken(r.data.access_token)
    } catch (e) { setTokenError('Token failed — ' + (e.message || 'check .env')) }
    finally { setTokLoad(false) }
  }

  const fetchData = useCallback(async () => {
    if (!token) { setError('Generate a token first'); return }
    setLoading(true); setError('')
    try {
      const h = { Authorization: `Bearer ${token}` }
      const [a, t, p] = await Promise.all([
        axios.get(`${GATEWAY}/accounts`,               { headers: h }),
        axios.get(`${GATEWAY}/transactions`,           { headers: h }),
        axios.get(`${GATEWAY}/payments/PAY001/status`, { headers: h }),
      ])
      setAccounts(a.data.accounts || [])
      setTransactions(t.data.transactions || [])
      setPayments(p.data ? [p.data] : [])
      setRefreshTime(new Date().toLocaleTimeString())
      setReqCount(c => c + 3)
    } catch (e) {
      const s = e.response?.status
      if (s === 401) setError('401 — Token expired')
      else if (s === 403) setError('403 — Insufficient scope')
      else if (s === 429) setError('429 — Rate limit exceeded')
      else setError('Gateway unreachable — ' + (e.message || 'check WSO2'))
    } finally { setLoading(false) }
  }, [token])

  const totalBal    = accounts.reduce((s, a) => s + a.balance, 0)
  const credits     = transactions.filter(t => t.type === 'Credit')
  const debits      = transactions.filter(t => t.type === 'Debit')
  const creditTotal = credits.reduce((s, t) => s + t.amount, 0)
  const debitTotal  = debits.reduce((s, t) => s + t.amount, 0)

  const totalTests  = TEST_COLLECTIONS.flatMap(c => c.tests).length
  const passedTests = TEST_COLLECTIONS.flatMap(c => c.tests).filter(t => t.status === 'PASS').length

  const navItems = [
    { id: 'overview',     label: 'Overview',     icon: <GridView      sx={{ fontSize: 17 }} /> },
    { id: 'accounts',     label: 'Accounts',     icon: <AccountBalance sx={{ fontSize: 17 }} />, badge: accounts.length || null },
    { id: 'transactions', label: 'Transactions', icon: <Receipt        sx={{ fontSize: 17 }} />, badge: transactions.length || null },
    { id: 'payments',     label: 'Payments',     icon: <Payment        sx={{ fontSize: 17 }} />, badge: payments.length || null },
    { id: 'gateway',      label: 'Gateway',      icon: <Hub            sx={{ fontSize: 17 }} /> },
    { id: 'tests',        label: 'Test Results', icon: <BugReport      sx={{ fontSize: 17 }} />, badge: `${passedTests}/${totalTests}` },
  ]

  const renderPage = () => {
    const props = { accounts, transactions, payments, credits, debits, creditTotal, debitTotal, totalBal, reqCount, token }
    switch (activePage) {
      case 'accounts':     return <AccountsPage     {...props} />
      case 'transactions': return <TransactionsPage {...props} />
      case 'payments':     return <PaymentsPage     {...props} />
      case 'gateway':      return <GatewayPage      {...props} />
      case 'tests':        return <TestsPage />
      default:             return <OverviewPage     {...props} />
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 2, '& .MuiLinearProgress-bar': { background: '#635BFF' } }} />}

      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F6F8FA' }}>

        {/* SIDEBAR */}
        <Box sx={{ width: SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRight: '1px solid #E3E8EE', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10 }}>
          <Box sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid #E3E8EE' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #635BFF, #4B44CC)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBalance sx={{ fontSize: 17, color: 'white' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', lineHeight: 1.2 }}>OpenBankAPI</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#8898AA' }}>WSO2 API Manager 4.6</Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, py: 1.5, px: 1.5, overflowY: 'auto' }}>
            <Typography sx={{ px: 1, pb: 1, fontSize: '0.6rem', fontWeight: 700, color: '#CBD5E0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Main</Typography>
            {navItems.slice(0, 5).map(item => (
              <Box key={item.id} onClick={() => setActivePage(item.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.2, py: 0.9, borderRadius: 1.5, cursor: 'pointer', mb: 0.3, background: activePage === item.id ? alpha('#635BFF', 0.08) : 'transparent', color: activePage === item.id ? '#635BFF' : '#425466', transition: 'all 0.15s', '&:hover': { background: activePage === item.id ? alpha('#635BFF', 0.1) : '#F6F8FA', color: activePage === item.id ? '#635BFF' : '#0A2540' } }}>
                <Box sx={{ color: 'inherit', display: 'flex' }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.825rem', fontWeight: activePage === item.id ? 600 : 400, color: 'inherit', flex: 1 }}>{item.label}</Typography>
                {item.badge ? <Chip label={item.badge} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, background: activePage === item.id ? alpha('#635BFF', 0.12) : '#F0F4F8', color: activePage === item.id ? '#635BFF' : '#8898AA', borderRadius: '10px', minWidth: 24 }} /> : null}
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ px: 1, pb: 1, fontSize: '0.6rem', fontWeight: 700, color: '#CBD5E0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Testing</Typography>
            {navItems.slice(5).map(item => (
              <Box key={item.id} onClick={() => setActivePage(item.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.2, py: 0.9, borderRadius: 1.5, cursor: 'pointer', mb: 0.3, background: activePage === item.id ? alpha('#0D7A4E', 0.08) : 'transparent', color: activePage === item.id ? '#0D7A4E' : '#425466', transition: 'all 0.15s', '&:hover': { background: activePage === item.id ? alpha('#0D7A4E', 0.1) : '#F6F8FA', color: activePage === item.id ? '#0D7A4E' : '#0A2540' } }}>
                <Box sx={{ color: 'inherit', display: 'flex' }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.825rem', fontWeight: activePage === item.id ? 600 : 400, color: 'inherit', flex: 1 }}>{item.label}</Typography>
                {item.badge ? <Chip label={item.badge} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, background: alpha('#0D7A4E', 0.1), color: '#0D7A4E', borderRadius: '10px', minWidth: 24 }} /> : null}
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ px: 1, pb: 1, fontSize: '0.6rem', fontWeight: 700, color: '#CBD5E0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Security</Typography>
            {[{ label: 'OAuth2 Scopes', icon: <Shield sx={{ fontSize: 17 }} /> }, { label: 'Rate Limiting', icon: <Speed sx={{ fontSize: 17 }} /> }].map(item => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.2, py: 0.9, borderRadius: 1.5, color: '#8898AA', cursor: 'default', mb: 0.3 }}>
                <Box sx={{ color: 'inherit', display: 'flex' }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.825rem', color: 'inherit' }}>{item.label}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ px: 2, py: 1.8, borderTop: '1px solid #E3E8EE', background: '#FAFBFC' }}>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Circle sx={{ fontSize: 8, color: token ? '#0D7A4E' : '#CBD5E0' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#8898AA' }}>{token ? 'Token active' : 'No token'}</Typography>
            </Stack>
            {refreshTime && <Typography sx={{ fontSize: '0.65rem', color: '#CBD5E0', mt: 0.3 }}>Synced {refreshTime}</Typography>}
          </Box>
        </Box>

        {/* MAIN */}
        <Box sx={{ flex: 1, ml: `${SIDEBAR_W}px`, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ height: 56, background: '#FFFFFF', borderBottom: '1px solid #E3E8EE', display: 'flex', alignItems: 'center', px: 3, gap: 1.5, position: 'sticky', top: 0, zIndex: 5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0A2540' }}>{navItems.find(n => n.id === activePage)?.label}</Typography>
            </Box>
            {[
              { label: 'WSO2 4.6',              sx: { background: alpha('#635BFF', 0.08), color: '#635BFF', border: `1px solid ${alpha('#635BFF', 0.2)}` } },
              { label: 'OAuth2 JWT',             sx: { background: '#F0F4F8', color: '#64748B', border: '1px solid #E2E8F0' } },
              ...(token ? [{ label: 'Token Active', sx: { background: alpha('#0D7A4E', 0.08), color: '#0D7A4E', border: `1px solid ${alpha('#0D7A4E', 0.2)}` } }] : []),
              { label: `${passedTests}/${totalTests} tests`, sx: { background: alpha('#0D7A4E', 0.08), color: '#0D7A4E', border: `1px solid ${alpha('#0D7A4E', 0.2)}` } },
              { label: `${reqCount} calls`,      sx: { background: '#F0F4F8', color: '#64748B', border: '1px solid #E2E8F0' } },
            ].map((b, i) => <Chip key={i} label={b.label} size="small" sx={{ ...b.sx, borderRadius: '6px', height: 24, fontSize: '0.7rem', fontWeight: 600 }} />)}

            {!token
              ? <Button variant="contained" size="small" onClick={generateToken} disabled={tokenLoading} startIcon={tokenLoading ? <CircularProgress size={12} color="inherit" /> : <FlashOn sx={{ fontSize: 14 }} />} sx={{ ml: 1, fontSize: '0.78rem', py: 0.6 }}>{tokenLoading ? 'Generating...' : 'Generate Token'}</Button>
              : <Button variant="outlined"  size="small" onClick={fetchData}      disabled={loading}      startIcon={loading      ? <CircularProgress size={12} color="inherit" /> : <Refresh  sx={{ fontSize: 14 }} />} sx={{ ml: 1, fontSize: '0.78rem', py: 0.6 }}>{loading ? 'Loading...' : 'Refresh'}</Button>
            }
          </Box>

          {(tokenError || error) && (
            <Box sx={{ px: 3, pt: 2 }}>
              {tokenError && <Alert severity="error"   sx={{ mb: 1 }}>{tokenError}</Alert>}
              {error      && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}
            </Box>
          )}

          <Box sx={{ p: 3, flex: 1 }}>{renderPage()}</Box>

          <Box sx={{ px: 3, py: 2, borderTop: '1px solid #E3E8EE', background: '#FFFFFF' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['WSO2 API Manager 4.6', 'Node.js 18 LTS', 'OAuth2', 'Docker', 'GitHub Actions', 'Choreo Analytics'].map(t => (
                  <MonoChip key={t} label={t} />
                ))}
              </Stack>
              <Typography sx={{ fontSize: '0.7rem', color: '#CBD5E0' }}>OpenBankAPI Gateway</Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}