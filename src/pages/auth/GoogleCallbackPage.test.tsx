import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { GoogleCallbackPage } from './GoogleCallbackPage'

type AuthStateMock = {
  loginWithGoogleCode: ReturnType<typeof vi.fn>
}

const authState: AuthStateMock = {
  loginWithGoogleCode: vi.fn(),
}

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector: (state: AuthStateMock) => unknown) => selector(authState),
}))

describe('GoogleCallbackPage', () => {
  beforeEach(() => {
    authState.loginWithGoogleCode = vi.fn()
    sessionStorage.clear()
  })

  it('shows error when oauth state is invalid', async () => {
    window.history.pushState({}, '', '/auth/google/callback?code=abc&state=wrong')
    sessionStorage.setItem('google_oauth_state', 'expected')
    sessionStorage.setItem('google_oauth_state_ts', Date.now().toString())

    render(
      <MemoryRouter initialEntries={['/auth/google/callback?code=abc&state=wrong']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/state oauth không hợp lệ/i)).toBeInTheDocument()
  })

  it('exchanges code and navigates to home when callback is valid', async () => {
    window.history.pushState({}, '', '/auth/google/callback?code=abc&state=ok-state')
    sessionStorage.setItem('google_oauth_state', 'ok-state')
    sessionStorage.setItem('google_oauth_state_ts', Date.now().toString())
    authState.loginWithGoogleCode.mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/auth/google/callback?code=abc&state=ok-state']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/home" element={<div>Home Mock</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(authState.loginWithGoogleCode).toHaveBeenCalledWith({
        code: 'abc',
        redirectUri: expect.stringMatching(/\/auth\/google\/callback$/),
      })
    })
    expect(await screen.findByText('Home Mock')).toBeInTheDocument()
  })
})
