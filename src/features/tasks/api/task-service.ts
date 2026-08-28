import { MOCK_TASKS } from "../data/mockTasks";

class TaskService {
    getTasks() {
        return MOCK_TASKS;
    }
}

export default TaskService;