
export const CHAVE_FONTE = 'menorpreco-tamanho-fonte';
export const CHAVE_TEMA = 'menorpreco-tema';

export type Tema = 'claro' | 'escuro';

export function carregarTamanhoFonte(): number {
  try {
    if (typeof window !== 'undefined') {
      const valor = window.localStorage.getItem(CHAVE_FONTE);

      if (valor !== null) {
        const tamanho = Number(valor);

        if (
          Number.isFinite(tamanho) &&
          tamanho >= 14 &&
          tamanho <= 26
        ) {
          return tamanho;
        }
      }
    }
  } catch (erro) {
    console.error('Erro ao carregar fonte:', erro);
  }

  return 16;
}

export function carregarTema(): Tema {
  try {
    if (typeof window !== 'undefined') {
      const valor = window.localStorage.getItem(CHAVE_TEMA);

      if (valor === 'claro' || valor === 'escuro') {
        return valor;
      }
    }
  } catch (erro) {
    console.error('Erro ao carregar tema:', erro);
  }

  return 'claro';
}
