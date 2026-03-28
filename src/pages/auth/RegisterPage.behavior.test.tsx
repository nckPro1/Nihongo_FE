import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { RegisterPage } from './RegisterPage'

type AuthStateMock = {
  register: ReturnType<typeof vi.fn>
  loading: boolean
}

const authState: AuthStateMock = {
  register: vi.fn(),
  loading: false,
}

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector: (state: AuthStateMock) => unknown) => selector(authState),
}))

describe('RegisterPage behavior', () => {
  beforeEach(() => {
    authState.register = vi.fn()
    authState.loading = false
  })

  it('submits registration and shows success message', async () => {
    authState.register.mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Tanaka Taro'), 'Nguyen Van A')
    await user.type(screen.getByPlaceholderText('example@nihongo.jp'), 'a@email.com')
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'Secret123')
    await user.type(passwordInputs[1], 'Secret123')
    await user.click(screen.getByRole('button', { name: /đăng ký \/ 登録/i }))

    expect(authState.register).toHaveBeenCalledWith({
      name: 'Nguyen Van A',
      email: 'a@email.com',
      password: 'Secret123',
      confirmPassword: 'Secret123',
    })
    expect(await screen.findByText(/đăng ký thành công/i)).toBeInTheDocument()
  })

  it('shows backend error when registration fails', async () => {
    authState.register.mockRejectedValue({
      response: { data: { message: 'Email đã tồn tại' } },
    })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Tanaka Taro'), 'Nguyen Van B')
    await user.type(screen.getByPlaceholderText('example@nihongo.jp'), 'b@email.com')
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'Secret123')
    await user.type(passwordInputs[1], 'Secret123')
    await user.click(screen.getByRole('button', { name: /đăng ký \/ 登録/i }))

    expect(await screen.findByText('Email đã tồn tại')).toBeInTheDocument()
  })

  it('blocks submit when password does not meet policy', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Tanaka Taro'), 'Nguyen Van C')
    await user.type(screen.getByPlaceholderText('example@nihongo.jp'), 'c@email.com')
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'secret123')
    await user.type(passwordInputs[1], 'secret123')
    await user.click(screen.getByRole('button', { name: /đăng ký \/ 登録/i }))

    expect(authState.register).not.toHaveBeenCalled()
    expect(await screen.findByText(/mật khẩu tối thiểu 8 ký tự/i)).toBeInTheDocument()
  })
})
