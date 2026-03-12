import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function Rating({ value }) {
  return (
    <div className="rating">
      {[1,2,3,4,5].map((star, i) => (
        value >= star ? <FaStar key={i}/> :
        value >= star - 0.5 ? <FaStarHalfAlt key={i}/> :
        <FaRegStar key={i}/>
      ))}
    </div>
  );
}

export default Rating;
