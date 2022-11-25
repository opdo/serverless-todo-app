import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid';

const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger("todos");

export async function createTodo(model: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info("Create to do user id", userId)

    const todoId = uuidv4();
    const createdDate = new Date().toISOString();
    const newItem = {} as TodoItem;
    newItem.todoId = todoId;
    newItem.createdAt = createdDate;
    newItem.done = false;
    newItem.userId = userId;
    newItem.name = model.name;
    newItem.dueDate = model.dueDate;

    return await todoAccess.createTodo(newItem);
}

export async function getTodosForUser(userId: string): Promise<any> {
    logger.info("Get to do user id", userId)

    return await todoAccess.getTodos(userId);
}

export async function deleteTodo(todoId: string, userId: string) {
    logger.info("Delete todo id")
    logger.info(todoId)

    await todoAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(todoId: string, userId: string, model: UpdateTodoRequest) {
    logger.info("Update todo id")

    await todoAccess.updateTodo(todoId, userId, model)
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info("create attachment presigned url")
    await todoAccess.updateImageSourceToDo(todoId, userId);
    return await attachmentUtils.getSignedUrl(todoId);
}