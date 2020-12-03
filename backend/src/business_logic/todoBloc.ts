import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { createLogger } from '../utils/logger'
import { v4 } from 'uuid'
import { TodoRepository } from "../repositories/todoRepository";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { parseUserId } from "../auth/utils";

const s3BucketName = process.env.TODOS_S3_BUCKET
const logger = createLogger('TodoBloc')
const todoRepository = new TodoRepository()

/**
 * 
 * @param userId
 * @returns list of TodoItem
 */
export const getAllTodosByUserId = async (
  jwtToken: string
): Promise<TodoItem[]> => {
  logger.info('In Get All Todos Bloc')
  const userId = parseUserId(jwtToken)

  return await todoRepository.getAllTodosByUserId(userId)
}

export const createTodo = async (
  createTodoRequest: CreateTodoRequest, jwtToken: string
): Promise<TodoItem> => {
  logger.info('In Create Todo Business logic')

  const userId = parseUserId(jwtToken)
  const newTodoId = v4()

  const todoItemModel: TodoItem = {
    userId: userId,
    todoId: newTodoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${newTodoId}`,
    ...createTodoRequest
  }

  return await todoRepository.createTodo(todoItemModel)
} 



export const updateTodoItem = async (
  jwtToken: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> => {
  logger.info('In Update todo Item bloc')

  const userId = parseUserId(jwtToken)
  const todoItem: TodoItem = {
    todoId,
    userId,
    createdAt: null,
    ...updateTodoRequest
  }

  return todoRepository.updateTodo(todoItem)
}

export const deleteTodo = async (
  jwtToken: string, todoId: string
): Promise<string> => {
  logger.info('In Delete TodoItem Bloc')

  const userId: string = parseUserId(jwtToken)

  return await todoRepository.deleteTodo(userId, todoId)
}