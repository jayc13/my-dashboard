import ToDoListWidget from '@/sections/tasks-page/components/ToDoList.tsx';

interface ToDoListSectionProps {
    isWideMode?: boolean;
}

const ToDoListSection = ({ isWideMode = false }: ToDoListSectionProps) => {
    return (
        <>
            <h2>To-Do List</h2>
            <ToDoListWidget isWideMode={isWideMode} />
        </>
    );
};

export default ToDoListSection;

