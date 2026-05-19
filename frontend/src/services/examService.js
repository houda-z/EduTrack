import api from './api';

export const getAllExams = async () => {
  const response = await api.get('/exams');
  return response.data;
};

export const getExamById = async (id) => {
  const response = await api.get(`/exams/${id}`);
  return response.data;
};

export const submitExamAnswers = async (id, answers) => {
  const response = await api.post(`/exams/${id}/submit`, answers);
  return response.data;
};

export const logCheatAttempt = async (examId, type) => {
  const response = await api.post(`/exams/${examId}/log-cheat`, { type });
  return response.data;
};