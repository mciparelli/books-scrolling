import { Observable as $ } from 'rx';
import { div } from '@cycle/dom';
import Author from './author';

export default ({ props$ }) => {
  const authorDOM$ = props$.flatMap(({ author }) => Author({ props$: $.just(author) }).DOM);
  const dom$ = $.combineLatest(props$, authorDOM$,
    ({ name, genre, date, height, background }, authorDOM) =>
    div('.book', {
      style: {
        background,
        height: `${height}px`,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      }
    }, [`${name} (${genre}) published by`, authorDOM, `on ${date}`])
  );
  return {
    DOM: dom$,
    authorGender$: props$.map(({ author }) => author.gender),
    genre$: props$.map(({ genre }) => genre),
    authorName$: props$.map(({ author }) => author.name)
  };
};
