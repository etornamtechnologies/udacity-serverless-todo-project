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

    //lets validate request body
    let errMsg = null;
    if(!updateTodoRequest.name) errMsg = 'Name field required!'
    if(!updateTodoRequest.dueDate) errMsg = 'Due date field required!'
    if(updateTodoRequest.done == undefined) errMsg = 'Done filed require!'
    if(errMsg) {
      return {
        statusCode: 500,
        body: JSON.stringify({message: errMsg})
      }
    }

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
