export default function outputHandler(statusCode, data) {
  const messages = {
    200: 'Success: Process completed successfully',
    201: 'Success: Element created successfully',
    404: 'Error: Route not found',
    500: 'Error: There was an issue with the server',
  };

  const message = messages[statusCode] || 'Error: An unexpected error occurred on the server';

  return {
    message,
    data: data || {},
  };
}
