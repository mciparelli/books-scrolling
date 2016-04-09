import combineLatestObj from 'rx-combine-latest-obj';
import { div, input, label, select, option, h3 } from '@cycle/dom';
import createBooksFactory from './generate';

const BOOK_HEIGHT = 100;
const LIST_HEIGHT = 500;

const BOOKS = 1000000;

const BOOK_GENRES = ['action', 'drama', 'comedy', 'tragedy', 'romance'];
const GENDERS = ['male', 'female'];

const createBooks = createBooksFactory({
  height: BOOK_HEIGHT,
  genres: BOOK_GENRES,
  genders: GENDERS
});
const books$ = createBooks(BOOKS).flatMap(combineLatestObj);

const take = scrollTop => Math.floor((scrollTop + LIST_HEIGHT) / BOOK_HEIGHT) +
  LIST_HEIGHT / BOOK_HEIGHT;

const styles = {
  filters: {
    margin: '20px auto',
    padding: '20px',
    'text-align': 'center',
    border: '1px solid black',
    width: '500px'
  },
  list: {
    border: '1px solid #eee',
    height: `${LIST_HEIGHT}px`,
    overflow: 'auto',
    textAlign: 'center'
  }
};

const intent = DOM => ({
  scroll$: DOM.select('.list').events('scroll', { useCapture: true })
    .pluck('currentTarget', 'scrollTop').startWith(0),
  gender$: DOM.select('.filters [name=gender]').events('change')
    .pluck('currentTarget', 'value').startWith(0),
  genre$: DOM.select('.filters [name=genre]').events('change')
    .pluck('currentTarget', 'value').startWith(0)
});

const model = ({ gender$, genre$, scroll$ }) =>
  combineLatestObj({ genre$, gender$, throttledScroll$: scroll$.throttle(200) })
    .flatMap(({ genre, gender, throttledScroll }) =>
      books$
        .filter(book => {
          if (!gender) return true;
          return book.authorGender === gender;
        })
        .filter(book => {
          if (!genre) return true;
          return book.genre === genre;
        })
        .pluck('DOM')
        .take(take(throttledScroll))
        .toArray()
  );

const filters = div('.filters', {
  style: styles.filters
}, [
  div('.gender', [
    h3('Gender'),
    label([
      'all',
      input({
        type: 'radio',
        name: 'gender',
        value: '',
        checked: true
      })
    ]),
    ...GENDERS.map(gender =>
      label([
        gender,
        input({
          type: 'radio',
          name: 'gender',
          value: gender
        })
      ])
    )
  ]),
  div('.genre', [
    h3('Genre'),
    select({
      name: 'genre'
    }, [
      option({
        value: ''
      }, '-----'),
      ...BOOK_GENRES.map(genre => option({
        value: genre
      }, genre))
    ])
  ])
]);

const getList = bookDOMs$ => bookDOMs$.map(bookDOMs => div('.list', {
  style: styles.list
}, bookDOMs));

const view = bookDOMs$ => getList(bookDOMs$).map(list =>
  div('.book-finder', [
    filters,
    list
  ])
);

export default ({ DOM }) => ({
  DOM: view(model(intent(DOM)))
});
