export function ArgumentsWindow({ onClose, randomSeed, argumentBlocks, onApplyArgument }) {
  const seedValue = randomSeed ?? "";
  return (
    <div className="prompt_window" role="presentation">
      <div className="window_backdrop" aria-hidden="true" onClick={onClose} />
      <section className="window" role="dialog" aria-modal="true" aria-labelledby="arguments_title" onClick={(event) => event.stopPropagation()}>
        <div className="window_header"><h1 id="arguments_title" className="prompt_title">Arguments</h1><button className="prompt_button window_close" type="button" aria-label="Close Arguments" onClick={onClose}>X</button></div>
        <div className="prompt_body window_body">
          {argumentBlocks.map((argument) => {
            const value = argument.value(seedValue);
            const example = `?${argument.parameter}=${encodeURIComponent(value)}`;
            return <section className="argument_block" key={argument.parameter}><h2>{argument.name}</h2><ul className="window_list"><li><button className="argument_code" type="button" disabled={!value} onClick={() => onApplyArgument(argument.parameter, value)}><code>{example}</code></button>{" "}{argument.description}</li><li>{argument.fallback}</li></ul></section>;
          })}
        </div>
      </section>
    </div>
  );
}
