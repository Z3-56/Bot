import { renderHook, act } from '@testing-library/react-hooks';
import { useChat } from './useChat';

// Mocking the fetch API
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ response: 'Test response' }),
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
      type: 'basic',
      url: '',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
    })
  );

  // Reset messages state
  jest.clearAllMocks();
  localStorage.clear();
});

describe('useChat Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useChat('en'));
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update state on sendMessage', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useChat('en'));

    act(() => {
      result.current.sendMessage('Hello');
    });

    await waitForNextUpdate();

    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[1].content).toBe('Test response');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should not update state on empty message', async () => {
    const { result } = renderHook(() => useChat('en'));

    act(() => {
      result.current.sendMessage('');
    });

    expect(result.current.messages.length).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update state on message with special characters', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useChat('en'));

    act(() => {
      result.current.sendMessage('Hello @#$%^&*!');
    });

    await waitForNextUpdate();

    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].content).toBe('Hello @#$%^&*!');
    expect(result.current.messages[1].content).toBe('Test response');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update state on long message', async () => {
    const longMessage = 'A'.repeat(1000);
    const { result, waitForNextUpdate } = renderHook(() => useChat('en'));

    act(() => {
      result.current.sendMessage(longMessage);
    });

    await waitForNextUpdate();

    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].content).toBe(longMessage);
    expect(result.current.messages[1].content).toBe('Test response');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
