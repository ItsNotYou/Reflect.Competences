<div id="newslist" class="list"><% _.each(newsSources, function(place, i) {
	var checked = !app.c.news.disabledNews[i] ? ' checked="checked"' : '';
	%>
	<div class="grid">
		<div class="col2 floatL fullWidth">
			<input type="checkbox" class="ch-news toggle" onchange="app.c.news.toggleNews(this)" data-id="<%=i%>" name="news-<%=i%>" id="news-<%=i%>"<%=checked%> />
			<label for="news-<%=i%>" data-on="" data-off="">
				<span><%=place%></span>
			</label>
		</div>
	</div>
<%
});
%></div>