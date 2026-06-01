<ul {!! $options !!}>
    @foreach ($menu_nodes as $key => $row)
        <li @if ($row->has_child) class="has-dropdown" @endif>
            <a href="{{ $row->url }}" target="{{ $row->target }}">
                @if ($row->icon_font) <i class="{{ trim($row->icon_font) }}"></i> @endif
                {{ $row->title }}
            </a>
            @if ($row->has_child)
                <ul class="submenu">
                    @foreach ($row->child as $child)
                        <li><a href="{{ $child->url }}">{{ $child->title }}</a></li>
                    @endforeach
                </ul>
            @endif
        </li>
    @endforeach
</ul>
