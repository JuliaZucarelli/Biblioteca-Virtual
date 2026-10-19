// busca um elemento pelo id com o tipo certo e devolve null se não existir 
export function porId<T extends HTMLElement = HTMLElement> (id : string) : T  | null {
    return document.getElementById(id) as T | null;
}

// elemento que está com o foco 
export function elementoFocado() : HTMLElement | null {
    return document.activeElement instanceof HTMLElement ? document.activeElement : null;
}