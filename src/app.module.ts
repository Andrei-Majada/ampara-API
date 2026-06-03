import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './User/user.module';
import { AuthModule } from './Auth/auth.module';
import { RequestModule } from './Request/request.module';
import { AboutModule } from './About/about.module';
import { TermsModule } from './Terms/terms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');

        if (!uri) {
          throw new Error('MONGO_URI environment variable is required');
        }

        return {
          uri,
        };
      },
    }),

    UserModule,
    AuthModule,
    RequestModule,
    TermsModule,
    AboutModule,
  ],
})
export class AppModule {}
