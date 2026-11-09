export class ErrorHttp extends Error {
  constructor(
    public estado: number,
    public codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

export const noEncontrado = () => new ErrorHttp(404, 'no_encontrado', 'No se encontró el registro');
