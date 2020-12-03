import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as middy from 'middy'
import { getToken } from '../../auth/utils'
import { updateTodoItem } from '../../business_logic/todoBloc'
import { TodoItem } from '../../models/TodoItem'
import { cors } from 'middy/middlewares'


const logger = createLogger('create todo handler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('In Update Todo Handler')

    const todoId = event.pathParameters.todoId
    const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)

    try {
      const jwtToken: string = getToken(event.headers.Authorization)
      const updatedTodo: TodoItem = await updateTodoItem(jwtToken, todoId, updateTodoRequest)
      
      return {
        statusCode: 200,
        body: JSON.stringify({ item: updatedTodo })
      }
    } catch(error) {
      logger.error(error)
      return {
        statusCode: 500,
        body: error.message
      }
    }
  }
)

handler.use(cors({ credentials: true }))
