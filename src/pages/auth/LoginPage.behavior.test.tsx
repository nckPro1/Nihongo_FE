import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { LoginPage } from './LoginPage'

type AuthStateMock = {
  login: ReturnType<typeof vi.fn>
  loading: boolean
}

const authState: AuthStateMock = {
  login: vi.fn(),
  loading: false,
}

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector: (state: AuthStateMock) => unknown) => selector(authState),
}))

describe('LoginPage behavior', () => {
  beforeEach(() => {
    authState.login = vi.fn()
    authState.loading = false
  })

  it('submits credentials and navigates to home', async () => {
    authState.login.mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<div>Home Mock</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('example@nihongo.jp'), 'user@email.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123')
    await user.click(screen.getByRole('button', { name: /đăng nhập \/ ログイン/i }))

    expect(authState.login).toHaveBeenCalledWith({ email: 'user@email.com', password: 'secret123' })
    expect(await screen.findByText('Home Mock')).toBeInTheDocument()
  })

  it('shows backend error message when login fails', async () => {
    authState.login.mockRejectedValue({
      response: { data: { message: 'Sai tài khoản hoặc mật khẩu' } },
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('example@nihongo.jp'), 'user@email.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong-pass')
    await user.click(screen.getByRole('button', { name: /đăng nhập \/ ログイン/i }))

    expect(await screen.findByText('Sai tài khoản hoặc mật khẩu')).toBeInTheDocument()
  })
})
