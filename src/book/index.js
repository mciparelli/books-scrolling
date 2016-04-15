import { Observable as $ } from 'rx';
import moment from 'moment';
import { div } from '@cycle/dom';
import Author from './author';

export default ({ props$ }) => {
  const authorDOM$ = props$.flatMap(({ author }) => Author({ props$: $.just(author) }).DOM);
  const dom$ = $.combineLatest(props$, authorDOM$,
    ({ name, genre, date, height }, authorDOM) =>
    div('.book', {
      style: {
        background: '#eee',
        border: '1px solid grey',
        height: `${height}px`,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      }
    }, [`${name} (${genre}) published by`, authorDOM, `on a ${moment(date).format('dddd, MMMM Do YYYY')}`])
  );
  return {
    DOM: dom$,
    name$: props$.pluck('name'),
    genre$: props$.pluck('genre'),
    date$: props$.pluck('date'),
    authorGender$: props$.pluck('author', 'gender'),
    authorName$: props$.pluck('author', 'name')
  };
};
