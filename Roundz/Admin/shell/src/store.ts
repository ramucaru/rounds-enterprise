import { configureStore, createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: { apiUrl: import.meta.env.VITE_ROUNDZ_API_URL ?? 'http://localhost:8080' },
  reducers: {}
});

export const store = configureStore({ reducer: { session: sessionSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
