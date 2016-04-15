import { Observable as $ } from 'rx';
import moment from 'moment';
import combineLatestObj from 'rx-combine-latest-obj';
import { take, pluck, orderBy, pipe } from 'lodash/fp';
import { div, input, label, select, option, h3, p } from '@cycle/dom';
import createBooksFactory from './generate';

const BOOK_HEIGHT = 100;
const LIST_HEIGHT = 500;

const BOOKS = 100000;

const BOOK_GENRES = ['action', 'drama', 'comedy', 'tragedy', 'romance', 'horror', 'finance'];
const GENDERS = ['male', 'female'];

const createBooks = createBooksFactory({
  height: BOOK_HEIGHT,
  genres: BOOK_GENRES,
  genders: GENDERS
});
const books = createBooks(BOOKS);

const howMany = scrollTop => Math.floor((scrollTop + LIST_HEIGHT) / BOOK_HEIGHT) +
  LIST_HEIGHT / BOOK_HEIGHT;

const isLastFridayInMonth = date => {
  const FRIDAY = 5;
  const momentDate = moment(date);
  const dayOfWeek = momentDate.day();
  if (dayOfWeek !== FRIDAY) return false;
  const dayOfMonth = momentDate.date();
  const lastMomentInMonth = momentDate.endOf('month');
  const lastDayInMonth = lastMomentInMonth.day();
  const daysToLastFriday = lastDayInMonth >= FRIDAY ? lastDayInMonth - FRIDAY : 7 - FRIDAY + lastDayInMonth;
  const lastFridayInMonth = lastMomentInMonth.clone().subtract(daysToLastFriday, 'day');
  return dayOfMonth === lastFridayInMonth.date();
};

const isHalloween = date => {
  const momentDate = moment(date);
  const HALLOWEEN_DAY = 31;
  const HALLOWEEN_MONTH = 10;
  return momentDate.date() === 31 && momentDate.month() + 1 === HALLOWEEN_MONTH;
};

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
    .pluck('currentTarget', 'scrollTop').startWith(0).throttle(200),
  gender$: DOM.select('[name=gender]').events('change')
    .pluck('currentTarget', 'value').startWith(null),
  genre$: DOM.select('[name=genre]').events('change')
    .pluck('currentTarget', 'value').startWith(null),
  sort$: DOM.select('[name=sort]').events('change')
    .pluck('currentTarget', 'value').startWith('authorName'),
  horrorHalloween$: DOM.select('[name=horror-halloween]').events('change')
    .pluck('currentTarget', 'checked').startWith(null),
  financeFriday$: DOM.select('[name=finance-friday]').events('change')
    .pluck('currentTarget', 'checked').startWith(null)
});

const model = (obj) =>
  combineLatestObj(obj)
    .flatMap(({ genre, gender, horrorHalloween, financeFriday, scroll=0, sort='authorName' }) => {
      const orderedArray = orderBy(sort)('asc')(books);
      return $.from(orderedArray)
        .flatMap(combineLatestObj)
        .filter(book => {
          if (!gender) return true;
          return book.authorGender === gender;
        })
        .filter(book => {
          if (!genre) return true;
          return book.genre === genre;
        })
        .filter(book => {
          if (!horrorHalloween) return true;
          return isHalloween(book.date) && genre === 'horror';
        })
        .filter(book => {
          if (!financeFriday) return true;
          return isLastFridayInMonth(book.date) && genre === 'finance';
        })
        .take(howMany(scroll))
        .pluck('DOM')
        .toArray()
  });

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
  ]),
  div('.sort', [
    h3('Sort by'),
    select({
      name: 'sort'
    }, [
      option({
        value: 'authorName'
      }, 'author'),
      option({
        value: 'name'
      }, 'name')
    ])
  ]),
  div('.special-filters', [
    h3('special filters'),
    label([
      'horror books on halloween',
      input({
        type: 'checkbox',
        name: 'horror-halloween'
      })
    ]),
    label([
      'finance books on last friday of the month',
      input({
        type: 'checkbox',
        name: 'finance-friday'
      })
    ])
  ])
]);

const getList = bookDOMs => div('.list', {
  style: styles.list
}, bookDOMs);

const view = bookDOMs$ => bookDOMs$.map(bookDOMs =>
  div('.book-finder', [
    filters,
    getList(bookDOMs),
    p({
      style: {
        textAlign: 'center'
      }
    }, `${bookDOMs.length} books`)
  ])
);

export default ({ DOM }) => ({
  DOM: view(model(intent(DOM)))
});
