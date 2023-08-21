import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Request } from 'express';
import { CreateTodoDto } from './dto/create-todo.dto';
import { EditTodoDto } from './dto';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  getTodos(@Req() req: Request) {
    return this.todoService.getTodos(req.user.id);
  }

  @Get(':id')
  getTodoById(@Req() req: Request, @Param('id', ParseIntPipe) todoId: number) {
    return this.todoService.getTodoById(req.user.id, todoId);
  }

  @Post()
  createTodo(@Req() req: Request, @Body() dto: CreateTodoDto) {
    return this.todoService.createTodo(req.user.id, dto);
  }

  @Patch(':id')
  editTodo(
    @Req() req: Request,
    @Param('id', ParseIntPipe) todoId: number,
    @Body() dto: EditTodoDto,
  ) {
    return this.todoService.editTodoById(req.user.id, todoId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteTodo(@Req() req: Request, @Param('id', ParseIntPipe) todoId: number) {
    return this.todoService.deleteTodo(req.user.id, todoId);
  }
}
