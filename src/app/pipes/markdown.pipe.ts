import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    let html = value;

    // Convertir les \n en vraies nouvelles lignes
    html = html.replace(/\\n/g, '\n');

    // Convertir les doubles nouvelles lignes en paragraphes
    html = html.replace(/\n\n/g, '</p><p>');

    // Convertir les simples nouvelles lignes en <br>
    html = html.replace(/\n/g, '<br>');

    // Encapsuler dans des paragraphes
    html = '<p>' + html + '</p>';

    // Nettoyer les paragraphes vides
    html = html.replace(/<p><\/p>/g, '');

    // Convertir le gras **texte**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convertir l'italique *texte*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convertir les listes numérotées
    html = html.replace(/(\d+\.\s)/g, '<br>$1');

    return html;
  }
}
