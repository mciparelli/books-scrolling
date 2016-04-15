import { Observable as $ } from 'rx';
import Book from './book';
import faker from 'faker';

const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start = new Date(2012, 0, 1), end = new Date()) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateFactory = ({ genders, genres, height }) => qty => {
  const books = [];
  for (let i = 0; i < qty; i++) {
    const props = {
      author: {
        name: faker.name.findName(),
        gender: randomItem(genders)
      },
      height,
      name: faker.commerce.productName(),
      genre: randomItem(genres),
      date: randomDate()
    };
    const book = Book({ props$: $.just(props) });
    books.push(book);
  }
  return books;
};

export default generateFactory;
