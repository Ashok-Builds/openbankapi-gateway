import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Box, Card, CardContent, Grid, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Stack,
  CircularProgress, Alert, Divider, LinearProgress, Avatar, Typography,
  TextField, InputAdornment, IconButton
} from '@mui/material'
import {
  AccountBalance, Receipt, Payment, Refresh, FlashOn,
  CheckCircle, Cancel, Warning, TrendingUp, TrendingDown,
  Shield, Speed, BarChart, GridView, Hub, ArrowUpward,
  ArrowDownward, Circle, Security, BugReport,
  Visibility, VisibilityOff, LockOutlined, PersonOutline, Logout,
  HealthAndSafety, Timeline, Bolt
} from '@mui/icons-material'
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, fontSize: '0.875rem',
            '&:hover fieldset': { borderColor: '#635BFF' },
            '&.Mui-focused fieldset': { borderColor: '#635BFF' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#635BFF' },
        },
      },
    },
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

const GATEWAY   = '/api/gateway/banking/1.0.0'
const TOKEN_URL = '/api/token/oauth2/token'
const SIDEBAR_W = 228

const fmt      = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtShort = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`

const TEST_COLLECTIONS = [
  {
    id: 'security', name: 'openBankApiSecurity-tests',
    description: 'Gateway security — OAuth2, scopes, rate limiting, field masking',
    postmanId: '5a19c687-104b-411a-9535-58cecd50d592', color: '#C4162A', bgColor: alpha('#C4162A', 0.06), icon: '🔐',
    tests: [
      { id: 'ST-01', name: 'fintech app bearer token',        method: 'POST', endpoint: '/oauth2/token',                    expected: '200 OK',               status: 'PASS', actual: '200 OK',            note: 'Token generated successfully with all 4 scopes' },
      { id: 'ST-02', name: '1 — Valid token GET accounts',    method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '200 OK',               status: 'PASS', actual: '200 OK',            note: 'Valid Bearer token accepted by WSO2 gateway' },
      { id: 'ST-03', name: '2 — No token',                    method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '401 Unauthorized',      status: 'PASS', actual: '401 Unauthorized',  note: 'Missing Authorization header blocked correctly' },
      { id: 'ST-04', name: '3 — Invalid token',               method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '401 Unauthorized',      status: 'PASS', actual: '401 Unauthorized',  note: 'Tampered JWT token rejected by gateway' },
      { id: 'ST-05', name: '4 — Wrong scope',                 method: 'GET',  endpoint: '/banking/1.0.0/payments/initiate', expected: '403 Forbidden',         status: 'PASS', actual: '403 Forbidden',     note: 'SandboxApp missing payments:write scope blocked' },
      { id: 'ST-06', name: '5 — Rate limit exceeded',         method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: '429 Too Many Requests', status: 'PASS', actual: '429 Too Many Requests', note: 'SandboxApp 6th request blocked — 5/min limit hit' },
      { id: 'ST-07', name: '6 — Missing required fields',     method: 'POST', endpoint: '/banking/1.0.0/payments/initiate', expected: '400 Bad Request',       status: 'PASS', actual: '400 Bad Request',   note: 'Payment missing account_to and amount rejected' },
      { id: 'ST-08', name: '7 — internal_ref field stripped', method: 'GET',  endpoint: '/banking/1.0.0/accounts',          expected: 'internal_ref absent',   status: 'PASS', actual: 'Field not present', note: 'WSO2 mediation policy stripped internal_ref successfully' },
    ],
  },
  {
    id: 'gateway', name: 'openBankGateway-tests',
    description: 'All API endpoint tests — Accounts, Transactions, Payments',
    postmanId: 'e8a2c156-6f33-4926-aec0-5ac9ea7451cb', color: '#635BFF', bgColor: alpha('#635BFF', 0.06), icon: '⚡',
    tests: [
      { id: 'GT-01', name: 'fintech app bearer token',  method: 'POST', endpoint: '/oauth2/token',                          expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: 'FintechApp client credentials token generated' },
      { id: 'GT-02', name: 'accounts',                  method: 'GET',  endpoint: '/banking/1.0.0/accounts',                expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: '3 accounts returned — internal_ref stripped' },
      { id: 'GT-03', name: 'accounts-id',               method: 'GET',  endpoint: '/banking/1.0.0/accounts/ACC001',         expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: 'Single account by ID returned correctly' },
      { id: 'GT-04', name: 'accounts-id-balance',       method: 'GET',  endpoint: '/banking/1.0.0/accounts/ACC001/balance', expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: 'Account balance returned — ₹45,000' },
      { id: 'GT-05', name: 'transactions',              method: 'GET',  endpoint: '/banking/1.0.0/transactions',            expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: '5 transactions returned' },
      { id: 'GT-06', name: 'transactions-id',           method: 'GET',  endpoint: '/banking/1.0.0/transactions/TXN001',     expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: 'Single transaction by ID returned' },
      { id: 'GT-07', name: 'transactions-filter',       method: 'POST', endpoint: '/banking/1.0.0/transactions/filter',     expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: 'Filtered by account_id — correct subset returned' },
      { id: 'GT-08', name: 'payments-initiate',         method: 'POST', endpoint: '/banking/1.0.0/payments/initiate',       expected: '201 Created', status: 'PASS', actual: '201 Created', note: 'Payment initiated — PAY ID generated' },
      { id: 'GT-09', name: 'payments-status',           method: 'GET',  endpoint: '/banking/1.0.0/payments/PAY001/status',  expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: 'Payment status returned — Completed' },
      { id: 'GT-10', name: 'payments-cancel',           method: 'POST', endpoint: '/banking/1.0.0/payments/cancel',         expected: '200 OK',      status: 'PASS', actual: '200 OK',      note: 'Pending payment cancelled successfully' },
    ],
  },
  {
    id: 'versioning', name: 'openBankVersioning-tests',
    description: 'API versioning — v1 owner field vs v2 account_holder field',
    postmanId: '2ec05ffd-cc60-4dc8-a14a-05de60cbcdec', color: '#0D7A4E', bgColor: alpha('#0D7A4E', 0.06), icon: '🔀',
    tests: [
      { id: 'VT-01', name: 'fintech app bearer token', method: 'POST', endpoint: '/oauth2/token',           expected: '200 OK',                       status: 'PASS', actual: '200 OK',                       note: 'Token generated with all scopes for versioning test' },
      { id: 'VT-02', name: 'version1-with product',   method: 'GET',  endpoint: '/banking/1.0.0/accounts', expected: '200 OK · owner field',          status: 'PASS', actual: '200 OK · owner field',          note: 'v1 returns { "owner": "Rahul Sharma" } — existing consumers unaffected' },
      { id: 'VT-03', name: 'version2-direct api',     method: 'GET',  endpoint: '/banking/2.0.0/accounts', expected: '200 OK · account_holder field', status: 'PASS', actual: '200 OK · account_holder field', note: 'v2 returns { "account_holder": "Rahul Sharma" } — breaking change on new version only' },
    ],
  },
]

// ── REUSABLE COMPONENTS ───────────────────────────────────────────────────
const MonoChip = ({ label }) => (
  <Chip label={label} size="small" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem', background: '#F0F4F8', color: '#64748B', border: '1px solid #E2E8F0', height: 20, borderRadius: '4px', fontWeight: 500 }} />
)

const StatusBadge = ({ status }) => {
  const cfg = { Completed: { color: '#065F46', bg: '#D1FAE5', dot: '#10B981' }, Pending: { color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' }, Cancelled: { color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' } }
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
      {isPass ? <CheckCircle sx={{ fontSize: 11, color: '#10B981' }} /> : <Cancel sx={{ fontSize: 11, color: '#EF4444' }} />}
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
        <Avatar sx={{ width: 40, height: 40, background: alpha(color, 0.1), borderRadius: 2, color }}>{icon}</Avatar>
      </Stack>
      {trend && (
        <Stack direction="row" alignItems="center" spacing={0.4} mt={1.5} pt={1.5} sx={{ borderTop: '1px solid #F0F4F8' }}>
          {trend > 0 ? <ArrowUpward sx={{ fontSize: 13, color: '#0D7A4E' }} /> : <ArrowDownward sx={{ fontSize: 13, color: '#C4162A' }} />}
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: trend > 0 ? '#0D7A4E' : '#C4162A' }}>{Math.abs(trend)}%</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>from last period</Typography>
        </Stack>
      )}
    </CardContent>
  </Card>
)

// ── LOGIN PAGE ─────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [username,     setUsername]     = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username || !password) { setError('Please enter both username and password'); return }
    if (username !== 'admin' || password !== 'admin') { setError('Invalid credentials — use admin / admin'); return }
    onLogin()
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#F6F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 450, height: 450, borderRadius: '50%', background: alpha('#635BFF', 0.05), pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 350, height: 350, borderRadius: '50%', background: alpha('#0D7A4E', 0.04), pointerEvents: 'none' }} />
      <Box sx={{ width: '100%', maxWidth: 420, px: 2 }}>
        <Box textAlign="center" mb={4}>
          <Box sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #635BFF, #4B44CC)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(99,91,255,0.3)' }}>
            <AccountBalance sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.5px', mb: 0.5 }}>OpenBankAPI</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#8898AA' }}>WSO2 API Manager 4.6 — Banking Dashboard</Typography>
        </Box>
        <Card sx={{ boxShadow: '0 8px 40px rgba(10,37,64,0.1)', border: '1px solid #E3E8EE' }}>
          <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', mb: 0.5 }}>Sign in</Typography>
            <Typography sx={{ fontSize: '0.825rem', color: '#8898AA', mb: 3 }}>Enter your credentials to access the dashboard</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth size="small" autoComplete="username"
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline sx={{ fontSize: 18, color: '#8898AA' }} /></InputAdornment> }} />
                <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} fullWidth size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 18, color: '#8898AA' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff sx={{ fontSize: 18, color: '#8898AA' }} /> : <Visibility sx={{ fontSize: 18, color: '#8898AA' }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }} />
                {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}
                <Button type="submit" variant="contained" fullWidth sx={{ py: 1.2, fontSize: '0.875rem' }}>Sign In</Button>
              </Stack>
            </Box>
            <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #F0F4F8' }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Shield sx={{ fontSize: 14, color: '#8898AA' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#8898AA' }}>
                  Use <Box component="span" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: '#635BFF' }}>admin</Box>
                  {' / '}
                  <Box component="span" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, color: '#635BFF' }}>admin</Box> to sign in
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
        <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: '#CBD5E0', mt: 3 }}>
          OpenBankAPI Gateway · WSO2 API Manager 4.6 · OAuth2 JWT
        </Typography>
      </Box>
    </Box>
  )
}

// ── FEATURE 1: API HEALTH CHECK PAGE ─────────────────────────────────────
const BACKENDS = [
  { id: 'accounts-v1',   label: 'Accounts v1',   url: 'http://localhost:3001/accounts',     port: 3001, color: '#635BFF', field: 'owner' },
  { id: 'accounts-v2',   label: 'Accounts v2',   url: 'http://localhost:3004/accounts',     port: 3004, color: '#0D7A4E', field: 'account_holder' },
  { id: 'transactions',  label: 'Transactions',  url: 'http://localhost:3002/transactions', port: 3002, color: '#B54708', field: 'transactions' },
  { id: 'payments',      label: 'Payments',      url: 'http://localhost:3003/payments',     port: 3003, color: '#0EA5E9', field: 'payments' },
]

const HealthCheckPage = () => {
  const [results,   setResults]   = useState({})
  const [checking,  setChecking]  = useState(false)
  const [lastCheck, setLastCheck] = useState(null)

  const runHealthCheck = async () => {
    setChecking(true)
    const newResults = {}
    await Promise.all(BACKENDS.map(async (b) => {
      const start = Date.now()
      try {
        await axios.get(b.url, { timeout: 5000 })
        newResults[b.id] = { status: 'UP', ms: Date.now() - start }
      } catch (e) {
        const ms = Date.now() - start
        if (e.response) {
          newResults[b.id] = { status: 'UP', ms }
        } else {
          newResults[b.id] = { status: 'DOWN', ms: null, error: e.message }
        }
      }
    }))
    setResults(newResults)
    setLastCheck(new Date().toLocaleTimeString())
    setChecking(false)
  }

  useEffect(() => { runHealthCheck() }, [])

  const upCount   = Object.values(results).filter(r => r.status === 'UP').length
  const downCount = Object.values(results).filter(r => r.status === 'DOWN').length
  const avgMs     = Object.values(results).filter(r => r.ms).reduce((s, r, _, a) => s + r.ms / a.length, 0)

  return (
    <Box>
      <SectionHeader
        title="API Health Check"
        subtitle="Live status of all 4 backend services — checks direct backend connectivity and response time"
        action={
          <Button variant="contained" size="small" onClick={runHealthCheck} disabled={checking}
            startIcon={checking ? <CircularProgress size={12} color="inherit" /> : <Refresh sx={{ fontSize: 14 }} />}>
            {checking ? 'Checking...' : 'Check Now'}
          </Button>
        }
      />

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}><StatCard label="Total Backends" value={4}          sub="Node.js services"          icon={<Hub           sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Online"         value={upCount}    sub="Responding normally"       icon={<CheckCircle   sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Offline"        value={downCount}  sub={downCount > 0 ? 'Needs attention' : 'All clear'} icon={<Cancel sx={{ fontSize: 20 }} />} color={downCount > 0 ? '#C4162A' : '#8898AA'} /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Avg Response"   value={avgMs ? `${Math.round(avgMs)}ms` : '—'} sub="Direct backend ping" icon={<Speed sx={{ fontSize: 20 }} />} color="#B54708" /></Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Backend Services</Typography>
            {lastCheck && <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>Last checked at {lastCheck}</Typography>}
          </Stack>
        </Box>
        <CardContent sx={{ p: 0 }}>
          {BACKENDS.map((b, i) => {
            const r = results[b.id]
            const isUp = r?.status === 'UP'
            const isPending = !r
            return (
              <Box key={b.id} sx={{ px: 2.5, py: 2, borderBottom: i < BACKENDS.length - 1 ? '1px solid #F0F4F8' : 'none', '&:hover': { background: '#FAFBFC' } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 40, height: 40, background: alpha(b.color, 0.1), color: b.color, borderRadius: 2, fontSize: '0.7rem', fontWeight: 700 }}>
                    {b.port}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A2540' }}>{b.label}</Typography>
                      <MonoChip label={`port ${b.port}`} />
                      <MonoChip label={b.field} />
                    </Stack>
                    <Typography sx={{ fontSize: '0.72rem', color: '#8898AA', fontFamily: '"JetBrains Mono", monospace' }}>{b.url}</Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {r?.ms && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: r.ms < 100 ? '#0D7A4E' : r.ms < 300 ? '#B54708' : '#C4162A', fontFamily: '"JetBrains Mono", monospace' }}>
                          {r.ms}ms
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#8898AA' }}>response time</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.5, py: 0.6, borderRadius: '20px', minWidth: 72, justifyContent: 'center',
                      background: isPending ? '#F0F4F8' : isUp ? alpha('#0D7A4E', 0.1) : alpha('#C4162A', 0.1) }}>
                      {isPending
                        ? <CircularProgress size={10} />
                        : <Circle sx={{ fontSize: 8, color: isUp ? '#10B981' : '#EF4444' }} />}
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: isPending ? '#8898AA' : isUp ? '#065F46' : '#991B1B' }}>
                        {isPending ? 'Checking' : r.status}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
                {r?.ms && (
                  <Box sx={{ mt: 1.5, ml: 7 }}>
                    <LinearProgress variant="determinate" value={Math.min((r.ms / 500) * 100, 100)}
                      sx={{ height: 4, '& .MuiLinearProgress-bar': { background: r.ms < 100 ? '#10B981' : r.ms < 300 ? '#F59E0B' : '#EF4444' } }} />
                  </Box>
                )}
              </Box>
            )
          })}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE', background: alpha('#635BFF', 0.03) }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Response Time Guide</Typography>
        </Box>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            {[['< 100ms', 'Excellent', '#0D7A4E'], ['100–300ms', 'Acceptable', '#B54708'], ['> 300ms', 'Slow / Check backend', '#C4162A']].map(([range, label, color]) => (
              <Stack key={range} direction="row" alignItems="center" spacing={1}>
                <Circle sx={{ fontSize: 10, color }} />
                <Typography sx={{ fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace', color: '#0A2540', fontWeight: 600 }}>{range}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#8898AA' }}>{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

// ── FEATURE 4: RATE LIMIT TESTER PAGE ────────────────────────────────────
const RateLimitPage = ({ token }) => {
  const [results,  setResults]  = useState([])
  const [running,  setRunning]  = useState(false)
  const [sandboxToken, setSandboxToken] = useState('')
  const [tokenLoading, setTokLoad]     = useState(false)
  const [tokenError,   setTokError]    = useState('')

  const generateSandboxToken = async () => {
    setTokLoad(true); setTokError(''); setSandboxToken(''); setResults([])
    try {
      const p = new URLSearchParams()
      p.append('grant_type', 'client_credentials')
      p.append('scope', 'accounts:read')
      const r = await axios.post(TOKEN_URL, p, {
        auth: { username: import.meta.env.VITE_SANDBOX_CLIENT_ID || '', password: import.meta.env.VITE_SANDBOX_CLIENT_SECRET || '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      setSandboxToken(r.data.access_token)
    } catch (e) {
      setTokError('SandboxApp token failed — add VITE_SANDBOX_CLIENT_ID and VITE_SANDBOX_CLIENT_SECRET to your .env file')
    } finally { setTokLoad(false) }
  }

  const runRateLimitTest = async () => {
    if (!sandboxToken) { setTokError('Generate SandboxApp token first'); return }
    setRunning(true); setResults([])
    const newResults = []
    for (let i = 1; i <= 6; i++) {
      const start = Date.now()
      try {
        await axios.get(`${GATEWAY}/accounts`, { headers: { Authorization: `Bearer ${sandboxToken}` } })
        newResults.push({ req: i, status: 200, label: '200 OK', ms: Date.now() - start, pass: true })
      } catch (e) {
        const status = e.response?.status || 0
        newResults.push({ req: i, status, label: status === 429 ? '429 Too Many Requests' : `${status} Error`, ms: Date.now() - start, pass: status === 429 })
      }
      setResults([...newResults])
      await new Promise(res => setTimeout(res, 300))
    }
    setRunning(false)
  }

  const hit429 = results.find(r => r.status === 429)
  const allDone = results.length === 6

  return (
    <Box>
      <SectionHeader
        title="Rate Limit Tester"
        subtitle="Fires 6 rapid requests using SandboxApp token (5 req/min tier) — the 6th request must return 429"
      />

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}><StatCard label="SandboxApp Tier"  value="5 / min"  sub="Requests allowed"      icon={<Shield  sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Requests Fired"   value={results.length || 0} sub="Out of 6 total" icon={<Bolt    sx={{ fontSize: 20 }} />} color="#B54708" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="429 Triggered"    value={hit429 ? 'YES' : (allDone ? 'NO' : '—')} sub="Rate limit proof" icon={<Warning sx={{ fontSize: 20 }} />} color={hit429 ? '#0D7A4E' : '#8898AA'} /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="On Request #"     value={hit429 ? hit429.req : '—'} sub="Should be 6th" icon={<Cancel  sx={{ fontSize: 20 }} />} color={hit429 ? '#C4162A' : '#8898AA'} /></Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Step 1 — Generate SandboxApp Token</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#8898AA', mt: 0.3 }}>Requires VITE_SANDBOX_CLIENT_ID and VITE_SANDBOX_CLIENT_SECRET in your .env file</Typography>
            </Box>
            <Button variant="contained" size="small" onClick={generateSandboxToken} disabled={tokenLoading}
              startIcon={tokenLoading ? <CircularProgress size={12} color="inherit" /> : <FlashOn sx={{ fontSize: 14 }} />}>
              {tokenLoading ? 'Generating...' : 'Get SandboxApp Token'}
            </Button>
          </Stack>
        </Box>
        <CardContent sx={{ p: 2.5 }}>
          {tokenError && <Alert severity="error" sx={{ mb: 2 }}>{tokenError}</Alert>}
          {sandboxToken
            ? <Alert severity="success" sx={{ fontSize: '0.78rem' }}>SandboxApp token ready — 5 req/min tier active</Alert>
            : <Typography sx={{ fontSize: '0.8rem', color: '#8898AA' }}>No token yet. Click the button above to generate a SandboxApp token.</Typography>
          }
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Step 2 — Fire 6 Rapid Requests</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#8898AA', mt: 0.3 }}>Calls GET /banking/1.0.0/accounts 6 times — request 6 should return 429</Typography>
            </Box>
            <Button variant="contained" size="small" onClick={runRateLimitTest} disabled={running || !sandboxToken}
              startIcon={running ? <CircularProgress size={12} color="inherit" /> : <Bolt sx={{ fontSize: 14 }} />}
              sx={{ background: '#C4162A', '&:hover': { background: '#991B1B' } }}>
              {running ? 'Firing...' : 'Run Rate Limit Test'}
            </Button>
          </Stack>
        </Box>
        <CardContent sx={{ p: 0 }}>
          {results.length === 0 ? (
            <Box sx={{ px: 2.5, py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#8898AA', fontSize: '0.825rem' }}>Results will appear here as requests fire one by one</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request #</TableCell>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Response Time</TableCell>
                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map(r => (
                    <TableRow key={r.req} sx={{ background: r.status === 429 ? alpha('#C4162A', 0.03) : 'transparent' }}>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: r.status === 429 ? alpha('#C4162A', 0.1) : alpha('#635BFF', 0.08), fontSize: '0.8rem', fontWeight: 700, color: r.status === 429 ? '#C4162A' : '#635BFF' }}>
                          {r.req}
                        </Box>
                      </TableCell>
                      <TableCell><Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: '#425466' }}>GET /banking/1.0.0/accounts</Typography></TableCell>
                      <TableCell>
                        <Chip label={r.label} size="small" sx={{ background: r.status === 200 ? alpha('#0D7A4E', 0.1) : alpha('#C4162A', 0.1), color: r.status === 200 ? '#065F46' : '#991B1B', border: 'none', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.72rem', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.825rem', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: '#0A2540' }}>{r.ms}ms</Typography>
                      </TableCell>
                      <TableCell>
                        {r.status === 429
                          ? <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: '20px', background: alpha('#0D7A4E', 0.1) }}>
                              <CheckCircle sx={{ fontSize: 11, color: '#10B981' }} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#065F46' }}>Rate limit proven</Typography>
                            </Box>
                          : r.status === 200
                            ? <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>Request passed through</Typography>
                            : <Typography sx={{ fontSize: '0.72rem', color: '#C4162A' }}>Error</Typography>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {allDone && hit429 && (
        <Alert severity="success" sx={{ mt: 3, fontSize: '0.825rem' }}>
          Rate limiting is working correctly. Requests 1–5 passed through (200 OK). Request {hit429.req} was blocked with 429 Too Many Requests — WSO2 Sandbox tier (5 req/min) is enforced.
        </Alert>
      )}
      {allDone && !hit429 && (
        <Alert severity="warning" sx={{ mt: 3, fontSize: '0.825rem' }}>
          No 429 detected. Make sure you are using SandboxApp credentials (5 req/min tier) and not FintechApp (50 req/min tier).
        </Alert>
      )}
    </Box>
  )
}

// ── FEATURE 5: RESPONSE TIME CHART PAGE ──────────────────────────────────
const ResponseTimePage = ({ token }) => {
  const [measurements, setMeasurements] = useState([])
  const [running,      setRunning]      = useState(false)
  const [error,        setError]        = useState('')

  const ENDPOINTS = [
    { id: 'accounts',      label: 'GET /accounts',          url: `${GATEWAY}/accounts`,               color: '#635BFF' },
    { id: 'accounts-id',   label: 'GET /accounts/ACC001',   url: `${GATEWAY}/accounts/ACC001`,        color: '#0D7A4E' },
    { id: 'balance',       label: 'GET /accounts/balance',  url: `${GATEWAY}/accounts/ACC001/balance`,color: '#B54708' },
    { id: 'transactions',  label: 'GET /transactions',      url: `${GATEWAY}/transactions`,           color: '#0EA5E9' },
    { id: 'payment',       label: 'GET /payments/status',   url: `${GATEWAY}/payments/PAY001/status`, color: '#8B5CF6' },
  ]

  const runMeasurement = async () => {
    if (!token) { setError('Generate a token first from the topbar'); return }
    setRunning(true); setError('')
    const round = []
    const h = { Authorization: `Bearer ${token}` }
    for (const ep of ENDPOINTS) {
      const times = []
      for (let i = 0; i < 3; i++) {
        const start = Date.now()
        try { await axios.get(ep.url, { headers: h }) } catch {}
        times.push(Date.now() - start)
        await new Promise(res => setTimeout(res, 100))
      }
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      round.push({ ...ep, avg, min: Math.min(...times), max: Math.max(...times), times })
    }
    setMeasurements(round)
    setRunning(false)
  }

  const maxMs = measurements.length ? Math.max(...measurements.map(m => m.avg), 1) : 1

  return (
    <Box>
      <SectionHeader
        title="Response Time Chart"
        subtitle="Measures real API response times through the WSO2 gateway — run multiple times to see caching improvement"
        action={
          <Button variant="contained" size="small" onClick={runMeasurement} disabled={running || !token}
            startIcon={running ? <CircularProgress size={12} color="inherit" /> : <Timeline sx={{ fontSize: 14 }} />}>
            {running ? 'Measuring...' : 'Measure Now'}
          </Button>
        }
      />

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {measurements.length > 0 && (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={3}><StatCard label="Fastest" value={`${Math.min(...measurements.map(m => m.avg))}ms`} sub="Best endpoint"    icon={<Speed       sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
            <Grid item xs={12} sm={3}><StatCard label="Slowest" value={`${Math.max(...measurements.map(m => m.avg))}ms`} sub="Slowest endpoint" icon={<Warning     sx={{ fontSize: 20 }} />} color="#C4162A" /></Grid>
            <Grid item xs={12} sm={3}><StatCard label="Average" value={`${Math.round(measurements.reduce((s, m) => s + m.avg, 0) / measurements.length)}ms`} sub="Across all endpoints" icon={<BarChart sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
            <Grid item xs={12} sm={3}><StatCard label="Endpoints" value={measurements.length} sub="Measured this run" icon={<Hub sx={{ fontSize: 20 }} />} color="#B54708" /></Grid>
          </Grid>

          <Card sx={{ mt: 4 }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Response Time Bar Chart</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#8898AA' }}>Average of 3 calls per endpoint</Typography>
              </Stack>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={2.5}>
                {measurements.map(m => (
                  <Box key={m.id}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Circle sx={{ fontSize: 8, color: m.color }} />
                        <Typography sx={{ fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace', color: '#0A2540', fontWeight: 500 }}>{m.label}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography sx={{ fontSize: '0.7rem', color: '#8898AA' }}>min {m.min}ms · max {m.max}ms</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: m.color, fontFamily: '"JetBrains Mono", monospace', minWidth: 55, textAlign: 'right' }}>{m.avg}ms</Typography>
                      </Stack>
                    </Stack>
                    <Box sx={{ position: 'relative', height: 28, background: '#F0F4F8', borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${Math.max((m.avg / maxMs) * 100, 2)}%`,
                        background: `linear-gradient(90deg, ${m.color}, ${alpha(m.color, 0.7)})`,
                        borderRadius: 2, transition: 'width 0.6s ease',
                        display: 'flex', alignItems: 'center', px: 1,
                      }}>
                        {(m.avg / maxMs) > 0.2 && (
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'white', fontFamily: '"JetBrains Mono", monospace' }}>{m.avg}ms</Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A2540' }}>Detailed Results</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell align="right">Call 1</TableCell>
                    <TableCell align="right">Call 2</TableCell>
                    <TableCell align="right">Call 3</TableCell>
                    <TableCell align="right">Average</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {measurements.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.78rem', fontFamily: '"JetBrains Mono", monospace', color: m.color, fontWeight: 600 }}>{m.label}</Typography>
                      </TableCell>
                      {m.times.map((t, i) => (
                        <TableCell key={i} align="right">
                          <Typography sx={{ fontSize: '0.8rem', fontFamily: '"JetBrains Mono", monospace', color: '#425466' }}>{t}ms</Typography>
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: m.avg < 100 ? '#0D7A4E' : m.avg < 300 ? '#B54708' : '#C4162A' }}>{m.avg}ms</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.avg < 100 ? 'Excellent' : m.avg < 300 ? 'Good' : 'Slow'}
                          size="small"
                          sx={{ background: m.avg < 100 ? alpha('#0D7A4E', 0.1) : m.avg < 300 ? alpha('#B54708', 0.1) : alpha('#C4162A', 0.1), color: m.avg < 100 ? '#065F46' : m.avg < 300 ? '#92400E' : '#991B1B', border: 'none', fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Alert severity="info" sx={{ mt: 3, fontSize: '0.8rem' }}>
            Tip — run this test twice. The first run hits the backend directly. The second run is served from WSO2 cache (300s TTL) and should be significantly faster — this proves the 12× caching improvement.
          </Alert>
        </>
      )}

      {measurements.length === 0 && !running && (
        <Card sx={{ mt: 4, textAlign: 'center', py: 6 }}>
          <Timeline sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} />
          <Typography sx={{ color: '#8898AA', mb: 1 }}>No measurements yet</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#CBD5E0' }}>Generate a token first then click Measure Now</Typography>
        </Card>
      )}
    </Box>
  )
}

// ── TESTS PAGE ────────────────────────────────────────────────────────────
const TestsPage = () => {
  const [activeCollection, setActiveCollection] = useState('all')
  const allTests    = TEST_COLLECTIONS.flatMap(c => c.tests)
  const totalTests  = allTests.length
  const passedTests = allTests.filter(t => t.status === 'PASS').length
  const failedTests = totalTests - passedTests
  const passRate    = Math.round((passedTests / totalTests) * 100)
  const collectionsToShow = activeCollection === 'all' ? TEST_COLLECTIONS : TEST_COLLECTIONS.filter(c => c.id === activeCollection)
  return (
    <Box>
      <SectionHeader title="Test Results" subtitle="Postman collections — security tests, gateway endpoint tests, versioning tests" />
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}><StatCard label="Total Tests"  value={totalTests}     sub="Across 3 collections"                              icon={<BugReport   sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Tests Passed" value={passedTests}    sub="All scenarios green"                               icon={<CheckCircle sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Tests Failed" value={failedTests}    sub={failedTests === 0 ? 'No failures' : 'Review req.'} icon={<Cancel      sx={{ fontSize: 20 }} />} color={failedTests === 0 ? '#8898AA' : '#C4162A'} /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Pass Rate"    value={`${passRate}%`} sub="3 collections tested"                             icon={<Shield      sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
      </Grid>
      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
        {[{ id: 'all', label: 'All Collections', count: totalTests, color: '#635BFF' }, ...TEST_COLLECTIONS.map(c => ({ id: c.id, label: c.name, count: c.tests.length, color: c.color }))].map(tab => (
          <Box key={tab.id} onClick={() => setActiveCollection(tab.id)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, my: 4, borderRadius: 2, cursor: 'pointer', border: '1px solid', borderColor: activeCollection === tab.id ? tab.color : '#E3E8EE', background: activeCollection === tab.id ? alpha(tab.color, 0.06) : '#FFFFFF', transition: 'all 0.15s', '&:hover': { borderColor: tab.color, background: alpha(tab.color, 0.04) } }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: activeCollection === tab.id ? tab.color : '#425466' }}>{tab.label}</Typography>
            <Chip label={tab.count} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, background: activeCollection === tab.id ? alpha(tab.color, 0.12) : '#F0F4F8', color: activeCollection === tab.id ? tab.color : '#8898AA', borderRadius: '10px', minWidth: 24 }} />
          </Box>
        ))}
      </Stack>
      {collectionsToShow.map(collection => (
        <Card key={collection.id} sx={{ mb: 2.5, mt: 4 }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E3E8EE', background: collection.bgColor }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography sx={{ fontSize: 18 }}>{collection.icon}</Typography>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A2540', fontFamily: '"JetBrains Mono", monospace' }}>{collection.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#8898AA', mt: 0.2 }}>{collection.description}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`${collection.tests.filter(t => t.status === 'PASS').length}/${collection.tests.length} passed`} size="small" sx={{ background: alpha('#0D7A4E', 0.1), color: '#0D7A4E', border: 'none', fontSize: '0.72rem', fontWeight: 700 }} />
                <Typography sx={{ fontSize: '0.68rem', color: '#8898AA', fontFamily: '"JetBrains Mono", monospace' }}>ID: {collection.postmanId.split('-')[0]}...</Typography>
              </Stack>
            </Stack>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>ID</TableCell><TableCell>Test Name</TableCell><TableCell sx={{ width: 60 }}>Method</TableCell>
                  <TableCell>Endpoint</TableCell><TableCell>Expected</TableCell><TableCell>Actual</TableCell><TableCell sx={{ width: 80 }}>Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collection.tests.map(test => (
                  <TableRow key={test.id} sx={{ '&:hover td': { background: '#F9FAFB' } }}>
                    <TableCell><Typography sx={{ fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace', color: collection.color, fontWeight: 600 }}>{test.id}</Typography></TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '0.825rem', fontWeight: 500, color: '#0A2540' }}>{test.name}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#8898AA', mt: 0.3 }}>{test.note}</Typography>
                    </TableCell>
                    <TableCell><MethodChip method={test.method} /></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: '#425466' }}>{test.endpoint}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: '#64748B' }}>{test.expected}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: '0.75rem', fontFamily: '"JetBrains Mono", monospace', color: '#0A2540', fontWeight: 500 }}>{test.actual}</Typography></TableCell>
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
  const acctColors = [{ bar: '#635BFF', value: '#635BFF', bg: alpha('#635BFF', 0.06) }, { bar: '#0D7A4E', value: '#0D7A4E', bg: alpha('#0D7A4E', 0.06) }, { bar: '#B54708', value: '#B54708', bg: alpha('#B54708', 0.06) }]
  const totalTests  = TEST_COLLECTIONS.flatMap(c => c.tests).length
  const passedTests = TEST_COLLECTIONS.flatMap(c => c.tests).filter(t => t.status === 'PASS').length
  return (
    <Box>
      <SectionHeader title="Overview" subtitle="Summary of all accounts, transactions, payments and test results" />
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Balance"  value={accounts.length ? fmtShort(totalBal) : '—'}    sub={accounts.length ? fmt(totalBal) : 'No data'} icon={<AccountBalance sx={{ fontSize: 20 }} />} color="#635BFF" trend={4.2} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Credits"  value={credits.length  ? fmtShort(creditTotal) : '—'} sub={`${credits.length} transactions`}              icon={<TrendingUp     sx={{ fontSize: 20 }} />} color="#0D7A4E" trend={12.5} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Debits"   value={debits.length   ? fmtShort(debitTotal) : '—'}  sub={`${debits.length} transactions`}               icon={<TrendingDown   sx={{ fontSize: 20 }} />} color="#C4162A" trend={-3.1} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Tests Passing"  value={`${passedTests}/${totalTests}`}                sub="3 Postman collections"                         icon={<CheckCircle    sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
      </Grid>
      {accounts.length > 0 && (
        <Card sx={{ mb: 2.5, mt: 4 }}>
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
  const acctColors = [{ bar: '#635BFF', value: '#635BFF', bg: alpha('#635BFF', 0.06), border: alpha('#635BFF', 0.15) }, { bar: '#0D7A4E', value: '#0D7A4E', bg: alpha('#0D7A4E', 0.06), border: alpha('#0D7A4E', 0.15) }, { bar: '#B54708', value: '#B54708', bg: alpha('#B54708', 0.06), border: alpha('#B54708', 0.15) }]
  return (
    <Box>
      <SectionHeader title="Accounts" subtitle="All bank accounts with real-time balances via WSO2 gateway" action={<MonoChip label="GET /accounts" />} />
      {accounts.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}><AccountBalance sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} /><Typography color="text.secondary">Generate a token to load account data</Typography></Card>
      ) : (
        <>
          <Grid container spacing={2} mb={3}>
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
          <Card sx={{ my: 4 }}>
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
          <Grid item xs={12} sm={4}><StatCard label="Total Transactions" value={transactions.length} sub="All records loaded"             icon={<Receipt       sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Total Credits"      value={fmt(creditTotal)}    sub={`${credits.length} credit entries`} icon={<ArrowUpward   sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Total Debits"       value={fmt(debitTotal)}     sub={`${debits.length} debit entries`}   icon={<ArrowDownward sx={{ fontSize: 20 }} />} color="#C4162A" /></Grid>
        </Grid>
        <Card sx={{ my: 4 }}>
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
          <Grid item xs={12} sm={4}><StatCard label="Total Payments" value={payments.length}                                         sub="Records loaded"      icon={<Payment     sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Completed"      value={payments.filter(p => p.status === 'Completed').length}  sub="Successful payments"  icon={<CheckCircle sx={{ fontSize: 20 }} />} color="#0D7A4E" /></Grid>
          <Grid item xs={12} sm={4}><StatCard label="Pending"        value={payments.filter(p => p.status === 'Pending').length}    sub="Awaiting processing"  icon={<Warning     sx={{ fontSize: 20 }} />} color="#B54708" /></Grid>
        </Grid>
        <Card sx={{ my: 4 }}>
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
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}><StatCard label="Gateway Calls" value={reqCount}                       sub="This session"      icon={<BarChart  sx={{ fontSize: 20 }} />} color="#635BFF" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Auth Status"   value={token ? 'Active' : 'No Token'} sub="OAuth2 JWT"        icon={<Security  sx={{ fontSize: 20 }} />} color={token ? '#0D7A4E' : '#8898AA'} /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="Cache TTL"     value="300s"                          sub="12× performance"   icon={<Speed     sx={{ fontSize: 20 }} />} color="#B54708" /></Grid>
        <Grid item xs={12} sm={3}><StatCard label="API Versions"  value="2 live"                        sub="v1.0.0 + v2.0.0"  icon={<Hub       sx={{ fontSize: 20 }} />} color="#0EA5E9" /></Grid>
      </Grid>
      {rows.map(({ section, items }) => (
        <Card key={section} sx={{ mb: 2, my: 4 }}>
          <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid #E3E8EE', background: '#FAFBFC' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#425466', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{section}</Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            {items.map(([label, value, color], j) => (
              <Stack key={j} direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 1.5, borderBottom: j < items.length - 1 ? '1px solid #F0F4F8' : 'none', '&:hover': { background: '#FAFBFC' } }}>
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
  const [isLoggedIn,   setIsLoggedIn]   = useState(false)
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

  const handleLogin  = () => setIsLoggedIn(true)
  const handleLogout = () => {
    setIsLoggedIn(false); setToken(''); setAccounts([]); setTransactions([])
    setPayments([]); setReqCount(0); setRefreshTime(null)
    setError(''); setTokenError(''); setActivePage('overview')
  }

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
    { id: 'overview',      label: 'Overview',          icon: <GridView        sx={{ fontSize: 17 }} /> },
    { id: 'accounts',      label: 'Accounts',          icon: <AccountBalance  sx={{ fontSize: 17 }} />, badge: accounts.length || null },
    { id: 'transactions',  label: 'Transactions',      icon: <Receipt         sx={{ fontSize: 17 }} />, badge: transactions.length || null },
    { id: 'payments',      label: 'Payments',          icon: <Payment         sx={{ fontSize: 17 }} />, badge: payments.length || null },
    { id: 'gateway',       label: 'Gateway',           icon: <Hub             sx={{ fontSize: 17 }} /> },
    { id: 'tests',         label: 'Test Results',      icon: <BugReport       sx={{ fontSize: 17 }} />, badge: `${passedTests}/${totalTests}` },
    { id: 'health',        label: 'Health Check',      icon: <HealthAndSafety sx={{ fontSize: 17 }} /> },
    { id: 'ratelimit',     label: 'Rate Limit Tester', icon: <Bolt            sx={{ fontSize: 17 }} /> },
    { id: 'responsetime',  label: 'Response Times',    icon: <Timeline        sx={{ fontSize: 17 }} /> },
  ]

  const renderPage = () => {
    const props = { accounts, transactions, payments, credits, debits, creditTotal, debitTotal, totalBal, reqCount, token }
    switch (activePage) {
      case 'accounts':     return <AccountsPage     {...props} />
      case 'transactions': return <TransactionsPage {...props} />
      case 'payments':     return <PaymentsPage     {...props} />
      case 'gateway':      return <GatewayPage      {...props} />
      case 'tests':        return <TestsPage />
      case 'health':       return <HealthCheckPage />
      case 'ratelimit':    return <RateLimitPage    token={token} />
      case 'responsetime': return <ResponseTimePage token={token} />
      default:             return <OverviewPage     {...props} />
    }
  }

  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 2, '& .MuiLinearProgress-bar': { background: '#635BFF' } }} />}

      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F6F8FA' }}>
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
            {navItems.slice(5, 6).map(item => (
              <Box key={item.id} onClick={() => setActivePage(item.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.2, py: 0.9, borderRadius: 1.5, cursor: 'pointer', mb: 0.3, background: activePage === item.id ? alpha('#0D7A4E', 0.08) : 'transparent', color: activePage === item.id ? '#0D7A4E' : '#425466', transition: 'all 0.15s', '&:hover': { background: activePage === item.id ? alpha('#0D7A4E', 0.1) : '#F6F8FA', color: activePage === item.id ? '#0D7A4E' : '#0A2540' } }}>
                <Box sx={{ color: 'inherit', display: 'flex' }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.825rem', fontWeight: activePage === item.id ? 600 : 400, color: 'inherit', flex: 1 }}>{item.label}</Typography>
                {item.badge ? <Chip label={item.badge} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, background: alpha('#0D7A4E', 0.1), color: '#0D7A4E', borderRadius: '10px', minWidth: 24 }} /> : null}
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ px: 1, pb: 1, fontSize: '0.6rem', fontWeight: 700, color: '#CBD5E0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Diagnostics</Typography>
            {navItems.slice(6).map(item => (
              <Box key={item.id} onClick={() => setActivePage(item.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1.2, py: 0.9, borderRadius: 1.5, cursor: 'pointer', mb: 0.3, background: activePage === item.id ? alpha('#B54708', 0.08) : 'transparent', color: activePage === item.id ? '#B54708' : '#425466', transition: 'all 0.15s', '&:hover': { background: activePage === item.id ? alpha('#B54708', 0.1) : '#F6F8FA', color: activePage === item.id ? '#B54708' : '#0A2540' } }}>
                <Box sx={{ color: 'inherit', display: 'flex' }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.825rem', fontWeight: activePage === item.id ? 600 : 400, color: 'inherit', flex: 1 }}>{item.label}</Typography>
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
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.8}>
                  <Circle sx={{ fontSize: 8, color: token ? '#0D7A4E' : '#CBD5E0' }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#425466', fontWeight: 600 }}>admin</Typography>
                </Stack>
                {refreshTime && <Typography sx={{ fontSize: '0.6rem', color: '#CBD5E0', mt: 0.2 }}>Synced {refreshTime}</Typography>}
              </Box>
              <IconButton size="small" onClick={handleLogout} sx={{ color: '#8898AA', '&:hover': { color: '#C4162A', background: alpha('#C4162A', 0.08) } }}>
                <Logout sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ flex: 1, ml: `${SIDEBAR_W}px`, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ height: 56, background: '#FFFFFF', borderBottom: '1px solid #E3E8EE', display: 'flex', alignItems: 'center', px: 3, gap: 1.5, position: 'sticky', top: 0, zIndex: 5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0A2540' }}>{navItems.find(n => n.id === activePage)?.label}</Typography>
            </Box>
            {[
              { label: 'WSO2 4.6',                          sx: { background: alpha('#635BFF', 0.08), color: '#635BFF', border: `1px solid ${alpha('#635BFF', 0.2)}` } },
              { label: 'OAuth2 JWT',                         sx: { background: '#F0F4F8', color: '#64748B', border: '1px solid #E2E8F0' } },
              ...(token ? [{ label: 'Token Active',          sx: { background: alpha('#0D7A4E', 0.08), color: '#0D7A4E', border: `1px solid ${alpha('#0D7A4E', 0.2)}` } }] : []),
              { label: `${passedTests}/${totalTests} tests`, sx: { background: alpha('#0D7A4E', 0.08), color: '#0D7A4E', border: `1px solid ${alpha('#0D7A4E', 0.2)}` } },
              { label: `${reqCount} calls`,                  sx: { background: '#F0F4F8', color: '#64748B', border: '1px solid #E2E8F0' } },
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