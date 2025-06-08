import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle, PlayCircle } from 'lucide-react';
import { PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Card = styled(Link)`
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    text-decoration: none;
    color: inherit;
    transition: all ${({ theme }) => theme.transitions.normal};
    border: 1px solid ${({ theme }) => theme.colors.neutral.light};
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${({ theme }) => theme.shadows.lg};
        border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$completed ? props.theme.colors.success.main : props.theme.colors.primary.main};
        opacity: ${props => props.$completed || props.$locked ? 1 : 0};
        transition: opacity ${({ theme }) => theme.transitions.normal};
    }

    &:hover::before {
        opacity: 1;
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LessonNumber = styled.span`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.secondary};
    background-color: ${({ theme }) => theme.colors.neutral.light};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const StatusIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => {
        if (props.$locked) return props.theme.colors.neutral.light;
        if (props.$completed) return props.theme.colors.success.light;
        return props.theme.colors.primary.light;
    }};
    color: ${props => {
        if (props.$locked) return props.theme.colors.text.secondary;
        if (props.$completed) return props.theme.colors.success.main;
        return props.theme.colors.primary.main;
    }};
    transition: all ${({ theme }) => theme.transitions.normal};

    svg {
        width: 20px;
        height: 20px;
    }
`;

const Title = styled.h3`
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const Description = styled.p`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.neutral.light};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    overflow: hidden;
    margin-top: auto;
`;

const Progress = styled.div`
    width: ${props => props.$progress}%;
    height: 100%;
    background-color: ${props => props.$completed ? props.theme.colors.success.main : props.theme.colors.primary.main};
    transition: width 0.3s ease;
    border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const LessonCard = ({ lesson }) => {
    const {
        id,
        title,
        description,
        progress = 0,
        status = 'not_started', // not_started, in_progress, completed
        icon,
    } = lesson;

    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in_progress':
                return 'In Progress';
            default:
                return 'Not Started';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <div className="p-4">
                {/* Lesson Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="h-4 w-4 rounded-lg bg-red-500 dark:bg-red-600 flex items-center justify-center text-white">
                                {icon || <PlayIcon className="h-1.5 w-1.5" />}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {description}
                            </p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                        {status === 'completed' && <CheckCircleIcon className="h-1.5 w-1.5 mr-0.5" />}
                        {getStatusText()}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold inline-block text-red-600">
                                    Progress
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-red-600">
                                    {progress}%
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                            <div
                                style={{ width: `${progress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                    <Link
                        to={`/lessons/${id}`}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                        {status === 'completed' ? 'Review Lesson' : status === 'in_progress' ? 'Continue Lesson' : 'Start Lesson'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LessonCard; 