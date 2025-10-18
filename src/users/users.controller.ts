import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
constructor(private readonly usersService: UsersService) {}


@Get()
findAll() {
return this.usersService.findAll();
}


@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
return this.usersService.findOne(id);
}


@Post()
create(@Body() dto: CreateUserDto) {
return this.usersService.create(dto);
}


@Patch(':id')
update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
return this.usersService.update(id, dto);
}


@Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) {
return this.usersService.remove(id);
}
}