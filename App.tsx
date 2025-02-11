import { PropsWithChildren, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from './store';
import { toggleTheme } from './store/configSlice';

function App({ children }: PropsWithChildren) {
    const config = useSelector((state: IRootState) => state.config);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleTheme(localStorage.getItem('theme') || config.theme));
    }, [dispatch, config.theme]);

    return (
        <div className={`${(config.sidebar && 'toggle-sidebar') || ''} full collapsible-vertical ltr main-section relative font-nunito text-sm font-normal antialiased`}>
            {children}
        </div>
    );
}

export default App;
