import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  it('renders register title and primary actions', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /tạo tài khoản của bạn/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /đăng ký \/ 登録/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /đăng ký với google/i })).toBeInTheDocument()
  })
})
