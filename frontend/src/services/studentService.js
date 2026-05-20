import api from './api';

const studentService = {
    getStats: async () => {
        const response = await api.get('/student/stats');
        return response.data;
    },
    getCourses: async () => {
        const response = await api.get('/student/courses');
        return response.data;
    },
    getExams: async () => {
        const response = await api.get('/student/exams');
        return response.data;
    },
    getGrades: async () => {
        const response = await api.get('/student/grades');
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/student/profile');
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.post('/student/profile/update', data);
        return response.data;
    },
    submitExam: async (data) => {
        const response = await api.post('/student/exams/submit', data);
        return response.data;
    }
};

export default studentService;
