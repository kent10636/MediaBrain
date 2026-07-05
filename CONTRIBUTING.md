# Contributing to MediaBrain

Thank you for your interest in contributing to MediaBrain!

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or fix (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## Development Setup

```bash
npm install
npm run tauri dev
```

## Code Style

- Follow existing code patterns
- Run tests before submitting: `npm test`
- Keep commits focused and descriptive

## Internationalization (i18n)

- UI is bilingual (Chinese primary, English).
- Add new translation keys in `src/lib/i18n.ts`.
- Use `currentT('key')` in components (or the `t` helper).
- Test both languages via the toggle in the nav.
- System locale detection happens automatically on first launch.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Questions?

Feel free to open an issue for discussion.
