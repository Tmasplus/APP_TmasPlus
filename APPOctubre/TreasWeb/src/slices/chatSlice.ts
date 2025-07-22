import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  text: string;
  role: string;
  timestamp: number;
}
interface ChatState {
  messages: Message[];

  chat: any;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],

  chat: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchChatStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchChatSuccess(state, action: PayloadAction<any>) {
      state.chat = action.payload;
      state.loading = false;
    },
    fetchChatFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    sendMessageStart(state) {
      state.loading = true;
      state.error = null;
    },
    sendMessageSuccess(state, action: PayloadAction<Message>) {
      state.loading = false;
      state.messages.push(action.payload);
    },
    sendMessageFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchChatStart, fetchChatSuccess, fetchChatFailure, sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure, } = chatSlice.actions;
export default chatSlice.reducer;