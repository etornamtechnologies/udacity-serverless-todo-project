import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as middy from 'middy'
import { getToken } from '../../auth/utils'
import { createTodo } from '../../business_logic/todoBloc'
import { TodoItem } from '../../models/TodoItem'
import { cors } from 'middy/middlewares'


const logger = createLogger('create todo handler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('In Create Todo Handler')
    const createTodoRequest: CreateTodoRequest = JSON.parse(event.body)
    if(!createTodoRequest.name) {
      return {
        statusCode: 500,
        body: JSON.stringify({message: 'Name field required!'})
      }
    } else if(!createTodoRequest.dueDate) {
      return {
        statusCode: 500,
        body: JSON.stringify({message: 'Due date field required!'})
      }
    }
    
    try {
      const jwtToken: string = getToken(event.headers.Authorization)
      const createTodoResponse: TodoItem = await createTodo(createTodoRequest, jwtToken)
      
      return {
        statusCode: 200,
        body: JSON.stringify({ item: createTodoResponse })
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