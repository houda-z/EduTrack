import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import './MesCours.css';

const MesCours = () => {
    const courses = [
        {
            id: 1,
            title: "Développement React Avancé",
            teacher: "Dr. Sarah Connor",
            progress: 75,
            image: "⚛️",
            category: "Frontend"
        },
        {
            id: 2,
            title: "Architecture Laravel API",
            teacher: "Prof. James Smith",
            progress: 45,
            image: "🐘",
            category: "Backend"
        },
        {
            id: 3,
            title: "Base de données NoSQL",
            teacher: "Mme. Elena Vance",
            progress: 90,
            image: "💾",
            category: "Database"
        },
        {
            id: 4,
            title: "UI/UX Design Futuriste",
            teacher: "Mr. Victor Vance",
            progress: 10,
            image: "🎨",
            category: "Design"
        }
    ];

    return (
        <div className="courses-container">
            <div className="courses-grid">
                {courses.map((course) => (
                    <div key={course.id} className="module-card">
                        <div className="card-glitch-effect"></div>
                        <div className="card-inner">
                            <div className="module-header">
                                <div className="module-icon-box">
                                    <span className="module-emoji">{course.image}</span>
                                </div>
                                <span className="category-tag">{course.category}</span>
                            </div>

                            <div className="module-body">
                                <h3>{course.title}</h3>
                                <div className="teacher-info">
                                    <User size={14} />
                                    <span>{course.teacher}</span>
                                </div>

                                <div className="progress-section">
                                    <div className="progress-labels">
                                        <span>Progression</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="cyber-progress-bar">
                                        <div 
                                            className="cyber-progress-fill" 
                                            style={{ width: `${course.progress}%` }}
                                        >
                                            <div className="progress-glow"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="module-footer">
                                <button className="enter-course-btn">
                                    <span>ACCÉDER AU MODULE</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MesCours;
