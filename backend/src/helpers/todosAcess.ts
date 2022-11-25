import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly tableName = process.env.TODOS_TABLE) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos')

        const query = await this.docClient.query({
            TableName: process.env.TODOS_TABLE,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = query.Items
        return items as TodoItem[]
    }

    async createTodo(data: TodoItem): Promise<TodoItem> {
        logger.info('Create todo')

        await this.docClient.put({
            TableName: this.tableName,
            Item: data
        }).promise()

        return data
    }

    async updateTodo(todoId: string, userId: string, data: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Update todo')

        await this.docClient.update({
            TableName: this.tableName,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: "set #n = :n, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":n": data.name,
                ":dueDate": data.dueDate,
                ":done": data.done,
            },
            ExpressionAttributeNames: { '#n': "name" }
        }).promise();

        return data
    }

    // Update attachment Url
    async updateImageSourceToDo(todoId: string, userId: string) {
        const attachmentUrl = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`
        await this.docClient.update({
            TableName: this.tableName,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl,
            },
        }).promise();
    }

    async deleteTodo(todoId: string, userId: string) {
        logger.info('Delete todo')

        await this.docClient.delete({
            TableName: this.tableName,
            Key: {
                todoId: todoId,
                userId: userId
            },
        }).promise();
    }
}