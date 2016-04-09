import { span, strong } from '@cycle/dom';

export default ({ props$ }) => ({
  DOM: props$.map(({ name, gender }) =>
    span('.author', { style: { margin: '0 5px' } }, [strong(`${name}`), ' ', `(${gender})`]))
});
