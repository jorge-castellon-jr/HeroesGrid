import PRIcons from '../PRIcons'
import './Loading.scss'

const Loading = () => {
	return (
		<div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen overflow-hidden bg-white loading">
			<div className="spinner"></div>
			<PRIcons className="absolute" width="175" height="175" />
		</div>
	)
}

export default Loading
