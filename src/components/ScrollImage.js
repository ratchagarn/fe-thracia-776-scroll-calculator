function ScrollImage({ name }) {
  return (
    <img
      src={`images/${name}_Scroll.png`}
      alt={name}
      className="block"
      style={{ maxWidth: 'none', width: 24 }}
    />
  )
}

export default ScrollImage
