import { SagaIterator } from 'redux-saga';
import { takeLatest, call, put } from 'redux-saga/effects';
import { authenticationActionCreators, LoginRequestAction, LOGIN_REQUEST } from './reducer';
import { userActionCreators } from '../user/reducer';
import { login, getUser } from '../../api/apiClient';

export function* loginSaga(action: LoginRequestAction): SagaIterator {
  try {
    const { email, password } = action.payload;
    const loginResult = yield call(login, { email, password });
    yield put(
      authenticationActionCreators.loginSuccess(loginResult.firebaseUid, loginResult.email)
    );
    const user = yield call(getUser, loginResult.firebaseUid);
    yield put(userActionCreators.userDataSuccess(user));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[loginSaga/error]', error.message);
  }
}

export function* authenticationSaga(): SagaIterator {
  yield takeLatest(LOGIN_REQUEST, loginSaga);
}
