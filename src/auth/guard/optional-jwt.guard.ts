import { AuthGuard } from '@nestjs/passport';

export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest(_, user, __, ___) {
    return user;
  }
}
