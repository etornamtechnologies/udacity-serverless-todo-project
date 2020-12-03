import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'

const logger = createLogger('deleteTodoHandler')

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getToken } from '../../auth/utils'
import { deleteTodo} from '../../business_logic/todoBloc'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId: string = event.pathParameters.todoId
    logger.info('DeleteTodoHandler')
  // TODO: Get all TODO items for a current user
    try {
      const jwtToken: string = getToken(event.headers.Authorization)
      const deletedTodoId: string = await deleteTodo(jwtToken, todoId)
      
      return {
        statusCode: 200,
        body: JSON.stringify({ todoId: deletedTodoId })
      }
    } catch(err) {
      logger.error(err)
      return {
        statusCode: 500,
        body: err.message
      }
    }
  }
)

handler.use(cors({ credentials: true }))

