namespace Stockly.Application.Exceptions;

public class AiServiceException(string message, Exception? innerException = null)
    : Exception(message, innerException);
