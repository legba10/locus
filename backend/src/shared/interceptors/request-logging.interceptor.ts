import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Observable } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const requestId = req.headers["x-request-id"]?.toString() ?? randomUUID();
    const start = Date.now();

    try {
      res.setHeader("x-request-id", requestId);
    } catch {
      /* ignore */
    }

    const method = req.method;
    const path = (req as any).originalUrl ?? req.url ?? "";

    let errorMsg: string | null = null;

    return next.handle().pipe(
      catchError((err) => {
        errorMsg = err?.message ? String(err.message) : "unknown error";
        throw err;
      }),
      finalize(() => {
        const ms = Date.now() - start;
        const statusCode = res.statusCode;
        const hasAuth = !!req.headers?.authorization;
        const msg = `${method} ${path} ${statusCode} ${ms}ms rid=${requestId} auth=${hasAuth ? "yes" : "no"}`;

        if (statusCode >= 500 || errorMsg) {
          this.logger.warn(`${msg}${errorMsg ? ` err="${errorMsg}"` : ""}`);
        } else {
          this.logger.log(msg);
        }
      })
    );
  }
}

