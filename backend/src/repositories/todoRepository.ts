import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk-core'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const logger = createLogger('TodoRepository')

const XAWS = AWSXRay.captureAWS(AWS)

export class TodoRepository {
  constructor(
    private readonly todosTable: string = process.env.TODOS_TABLE,
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly userIdIndex: string = process.env.USER_ID_INDEX,
  ){}

  /**
   * 
   * @param userId
   * @returns lsit of TodoItem created by user with param userId  
   */
  async getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
    const response = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId':userId
        }
      }).promise()
    return response.Items as TodoItem[]
  }

  /**
   * 
   * @param todo 
   * @returns TodoItem
   */
  async createTodo(todo: TodoItem): Promise<TodoItem> {
    let todoItem = { ...todo }

    logger.info('Lets save Todo to DB', todo)

    await this.docClient
    .put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    logger.info('Todo created successfully!')
    return todoItem
  }

  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info(`Lets update todo in db with todo id ${todo.todoId}`, todo)

    const updateTodoExpression = 'SET dueDate = :todoDueDate, done = :todoDone'

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId: todo.todoId, userId: todo.userId },
        UpdateExpression: updateTodoExpression,
        ExpressionAttributeValues: {
          ':todoDueDate': todo.dueDate,
          ':todoDone': todo.done,
        },
        ReturnValues: 'UPDATED_NEW'
      }).promise()

      logger.info('Todo Item update successful')
      return todo;
  }

  /**
   * 
   * @param userId 
   * @param todoId 
   */
  async deleteTodo(userId: string, todoId: string): Promise<string> {
    logger.info(`Lets delete todo item with userId: ${userId} and todoId ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      }).promise()

      return todoId
  }

}

