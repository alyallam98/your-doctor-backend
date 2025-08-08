ex . {
"action": "update",
"resource": "user",
"userId": "66b62a322bbde1234d123abc",
"ip": "192.168.1.1",
"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
"meta": {
"before": { "email": "old@example.com" },
"after": { "email": "new@example.com" }
}
}

how to use it : 

await this.auditLogService.logAction({
action: 'create',
resource: 'user',
userId: user.id,
ip: request.ip,
userAgent: request.headers['user-agent'],
meta: { newUser: createdUser },
});

module => 
