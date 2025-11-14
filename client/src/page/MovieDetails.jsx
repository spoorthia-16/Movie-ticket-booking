import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'

const timeFormat = (minutes) => {
  if (!minutes) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}


const MovieDetails = () => {
  const navigate=useNavigate()
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id)
    if (show) {
      setShow({
        movie:show,
        dateTime: dummyDateTimeData
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    getShow()
  }, [id])

if (loading) return <Loading />


  if (!show) return <div className="text-center text-gray-400 py-20">Loading...</div>

  const { movie } = show

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-20 md:pt-32'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

        <img
          src={movie.poster_path}
          alt={movie.title}
          className='max-md:mx-auto rounded-xl h-[420px] w-[280px] object-cover shadow-lg'
        />

        <div className='relative flex flex-col gap-4'>
          <BlurCircle top='-100px' left='-100px' />

          <p className='text-primary uppercase tracking-wide'>ENGLISH</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance'>{movie.title}</h1>

          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fill-primary' />
            {movie.vote_average.toFixed(1)} User Rating
          </div>

          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>
            {movie.overview}
          </p>

          <p className='text-sm text-gray-400'>
            {timeFormat(movie.runtime)} • {movie.genres.map(g => g.name).join(', ')} • {movie.release_date.split('-')[0]}
          </p>

          <div className='flex gap-4 mt-4'>
            <button className='flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90'>
              <PlayCircleIcon className='w-5 h-5' />
              Watch Trailer
            </button>

            <a
              href='#dateSelect'
              className='flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition'
            >
              Buy Tickets
            </a>

            <button className='flex items-center justify-center border border-gray-500 text-gray-300 p-2 rounded-lg hover:text-primary hover:border-primary transition'>
              <Heart className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
       
       <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
       <div className='overflow-x-auto no-scrollbar mt-8 pb-4'></div>
       <div className='flex items-center gap-4 w-max px-4'> {show.movie.casts.slice(0,12).map((cast,index)=>(
        <div key={index} className='flex flex-col items-center text-center'><img src={cast.profile_path} alt="" className='rounded-full h-20 md:h-20 aspect-square object-cover'/>
        <p className='font-medium text-xs mt-3'>{cast.name}</p>
      </div>
      ))}
      </div>
      <DateSelect dateTime={show.dateTime} id={id} />
      <p className='text-lg font-medium mt-20 mb-8'>You May also Like</p>
      <div className='flex flex-wrap max-sm:justify-center gap-8 '>
        {dummyShowsData.slice(0,4).map((movie,index)=>(
          <MovieCard key={index} movie={movie}/>
        ))}
      </div>
      <div className='flex justify-center mt-20'>
        <button onClick={()=> {navigate('/movies'); scrollTo(0,0)}} className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show More</button>
      </div>
    </div>     
  )
}

export default MovieDetails
