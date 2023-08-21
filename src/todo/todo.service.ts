import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { EditTodoDto } from './dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  getTodos(userId: number) {
    return this.prisma.toDo.findMany({
      where: { userId },
    });
  }

  getTodoById(userId: number, todoId: number) {
    return this.prisma.toDo.findUnique({
      where: {
        id: todoId,
        userId,
      },
    });
  }

  async createTodo(userId: number, dto: CreateTodoDto) {
    return this.prisma.toDo.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async editTodoById(userId: number, todoId: number, dto: EditTodoDto) {
    //getting by id todo_
    const todo = await this.prisma.toDo.findUnique({
      where: {
        id: todoId,
      },
    });
    // check if user owns this todo_
    if (!todo || todo.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }
    return this.prisma.toDo.update({
      where: {
        id: todoId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteTodo(userId: number, todoId: number) {
    const todo = await this.prisma.toDo.findUnique({
      where: {
        id: todoId,
      },
    });
    // check if user owns this todo_
    if (!todo || todo.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }
    await this.prisma.toDo.delete({
      where: {
        id: todoId,
      },
    });
  }
}
